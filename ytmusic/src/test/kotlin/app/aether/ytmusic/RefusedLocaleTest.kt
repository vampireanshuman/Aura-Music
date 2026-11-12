package app.aether.ytmusic

import kotlinx.coroutines.runBlocking
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.jsonObject
import kotlinx.serialization.json.jsonPrimitive
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test
import java.io.IOException

/**
 * The service answers a language or country it doesn't offer with a 400 to every request (measured
 * 2026-11-11: Santali, Konkani, China, Iran, a blank). The client must find out which it was, ask
 * without it, and remember, so the phone's setting never leaves every page saying the service didn't
 * answer.
 */
class RefusedLocaleTest {
    /** A service that refuses [languages] and [regions]; [down] makes every request after the page fail on the network. */
    private class Service(val languages: Set<String> = emptySet(), val regions: Set<String> = emptySet(), val placed: String? = null) : HttpTransport {
        val asked = mutableListOf<Pair<String, String>>()
        var everythingRefused = false
        var down = false

        override suspend fun send(method: String, url: String, headers: Map<String, String>, body: ByteArray?): HttpResponse {
            if (method == "GET") {
                val country = placed?.let { ""","INNERTUBE_CONTEXT_GL":"$it"""" }.orEmpty()
                return HttpResponse(200, """{"INNERTUBE_CLIENT_VERSION":"1.20261111.01.00"$country}""".toByteArray())
            }
            if (down) throw IOException("SocketTimeoutException")
            val client = Json.parseToJsonElement(body!!.toString(Charsets.UTF_8)).jsonObject["context"]!!.jsonObject["client"]!!.jsonObject
            val hl = client["hl"]!!.jsonPrimitive.content
            val gl = client["gl"]!!.jsonPrimitive.content
            asked += hl to gl
            val refused = everythingRefused || hl in languages || gl in regions
            return if (refused) HttpResponse(400, """{"error":{"code":400,"status":"INVALID_ARGUMENT"}}""".toByteArray())
            else HttpResponse(200, "{}".toByteArray())
        }
    }

    private fun music(service: Service, hl: String, gl: String) = YouTubeMusic(language = { hl }, region = { gl }, transport = service)

    @Test
    fun `the country is where the service found the listener, not the phone's setting`() = runBlocking {
        // An Indian phone in Japan: Japan's picks.
        val service = Service(placed = "JP")
        music(service, "hi", "IN").home()
        assertEquals(listOf("hi" to "JP"), service.asked)
    }

    @Test
    fun `the phone's country only when the page says nothing`() = runBlocking {
        val service = Service(placed = null)
        music(service, "en", "GB").home()
        assertEquals(listOf("en" to "GB"), service.asked)
    }

    @Test
    fun `a place the service refuses is learned like any country`() = runBlocking {
        val service = Service(regions = setOf("IR"), placed = "IR")
        val yt = music(service, "fa", "IR")
        assertTrue(yt.home() is YtResult.Success)
        service.asked.clear()
        yt.home()
        assertEquals(listOf("fa" to "US"), service.asked)
    }

    @Test
    fun `a refused language is asked in English, and remembered`() = runBlocking {
        val service = Service(languages = setOf("sat"))
        val yt = music(service, "sat", "IN")
        assertTrue(yt.home() is YtResult.Success)
        assertEquals("en" to "IN", service.asked.last())
        service.asked.clear()
        assertTrue(yt.home() is YtResult.Success)
        assertEquals(listOf("en" to "IN"), service.asked)
    }

    @Test
    fun `a refused country is asked as the US, keeping the language`() = runBlocking {
        val service = Service(regions = setOf("CN"))
        val yt = music(service, "zh", "CN")
        assertTrue(yt.home() is YtResult.Success)
        assertEquals("zh" to "US", service.asked.last())
        service.asked.clear()
        yt.home()
        assertEquals(listOf("zh" to "US"), service.asked)
    }

    @Test
    fun `both refused at once`() = runBlocking {
        val service = Service(languages = setOf("mni"), regions = setOf("IR"))
        val yt = music(service, "mni", "IR")
        assertTrue(yt.home() is YtResult.Success)
        service.asked.clear()
        yt.home()
        assertEquals(listOf("en" to "US"), service.asked)
    }

    @Test
    fun `blank and odd values never reach the service`() = runBlocking {
        val service = Service()
        music(service, " ", "419").home()
        assertEquals(listOf("en" to "US"), service.asked)
    }

    @Test
    fun `a refusal that isn't the locale's teaches nothing`() = runBlocking {
        val service = Service().apply { everythingRefused = true }
        val yt = music(service, "hi", "IN")
        assertEquals(YtResult.Failure(YtError.Server(400)), yt.home())
        service.everythingRefused = false
        service.asked.clear()
        assertTrue(yt.home() is YtResult.Success)
        assertEquals(listOf("hi" to "IN"), service.asked)
    }

    @Test
    fun `a dropped connection while finding out teaches nothing`() = runBlocking {
        val service = Service(languages = setOf("kok"))
        val yt = music(service, "kok", "IN")
        // The first two asks are refused; then the network goes.
        val flaky = object : HttpTransport {
            var posts = 0
            override suspend fun send(method: String, url: String, headers: Map<String, String>, body: ByteArray?): HttpResponse {
                if (method == "POST" && ++posts > 2) throw IOException("SocketTimeoutException")
                return service.send(method, url, headers, body)
            }
        }
        val shaky = YouTubeMusic(language = { "kok" }, region = { "IN" }, transport = flaky)
        assertEquals(YtResult.Failure(YtError.Network), shaky.home())
        // Nothing was learned there: the next ask still goes in the phone's own language first.
        flaky.posts = -100
        service.asked.clear()
        shaky.home()
        assertEquals("kok" to "IN", service.asked.first())
        assertTrue(yt.home() is YtResult.Success)
    }
}
