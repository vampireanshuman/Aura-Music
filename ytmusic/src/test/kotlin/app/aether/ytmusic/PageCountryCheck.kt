package app.aether.ytmusic

import kotlinx.coroutines.runBlocking

/**
 * Where the music page places the visitor, asked with different languages (`./gradlew :ytmusic:pageCountryCheck`):
 * if the country followed the asker's settings it would change with them; it follows the connection.
 */
fun main() = runBlocking {
    for (accept in listOf("en", "ja-JP,ja;q=0.9", "en-US,en;q=0.9", "en-GB,en;q=0.9", "de-DE,de;q=0.9")) {
        val page = UrlConnectionTransport().send("GET", "https://music.youtube.com/", mapOf("User-Agent" to YouTubeMusic.DESKTOP_USER_AGENT, "Accept-Language" to accept), null)
        val html = page.body.toString(Charsets.UTF_8)
        val found = Regex(""""(INNERTUBE_CONTEXT_GL|INNERTUBE_CONTEXT_HL)"\s*:\s*"([^"]{1,12})"""")
            .findAll(html).map { it.groupValues[1].removePrefix("INNERTUBE_CONTEXT_") + "=" + it.groupValues[2] }.distinct().joinToString()
        println("asked as $accept -> $found")
    }
}
