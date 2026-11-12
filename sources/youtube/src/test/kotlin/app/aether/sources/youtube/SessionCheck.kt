package app.aether.sources.youtube

import app.aether.ytmusic.WebSession
import app.aether.ytmusic.YouTubeMusic
import app.aether.ytmusic.YtResult
import kotlinx.coroutines.runBlocking

/** What the service answers a session it won't accept (`./gradlew :sources:youtube:sessionCheck`). No real session is used. */
fun main() = runBlocking {
    val made = listOf(
        "SAPISID=AAAAAAAAAAAAAAAA/BBBBBBBBBBBBBBBBB",
        "SAPISID=AAAAAAAAAAAAAAAA/BBBBBBBBBBBBBBBBB; SID=g.a000aaaaaaaaaaaaaaaaaaaaaaaaaaaa; HSID=AAAAAAAAAAAAAAAAA; SSID=AAAAAAAAAAAAAAAAA; APISID=AAAAAAAAAAAAAAAA/BBBBBBBBBBBBBBBBB; __Secure-3PSID=g.a000aaaaaaaaaaaaaaaaaaaaa; LOGIN_INFO=AFmmF2swRAIgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
    )
    for (cookies in made) {
        val yt = YouTubeMusic(language = { "en" }, region = { "IN" }, session = { WebSession.parse(cookies) })
        for ((name, call) in listOf<Pair<String, suspend () -> YtResult<*>>>(
            "home" to { yt.home() },
            "library playlists" to { yt.library(YouTubeMusic.LIBRARY_PLAYLISTS) },
            "account" to { yt.account() },
        )) {
            val r = call()
            println("${cookies.length} chars, $name: ${if (r is YtResult.Failure) r.error else "answered"}")
        }
    }
}
