package app.aether.sources.youtube

import app.aether.ytmusic.YouTubeMusic
import app.aether.ytmusic.YtResult
import kotlinx.coroutines.runBlocking

/**
 * Asks Home live with the language and country a phone could send (`./gradlew :sources:youtube:localeCheck`),
 * through AETHER's own client, and says which pairs the service refuses.
 */
fun main() = runBlocking {
    // What Android's Locale can hand over: legacy codes (in, iw, ji), three-letter languages, regions
    // that aren't countries, and the plain ones.
    // The phone's country setting no longer decides: the service's own placement of the listener does.
    for ((hl, gl) in listOf("en" to "US", "en" to "JP", "en" to "GB", "sat" to "CN", "en" to "IR", "" to "")) {
        val yt = YouTubeMusic(language = { hl }, region = { gl })
        val r = yt.home()
        val picks = (r as? YtResult.Success)?.value?.shelves?.firstOrNull()?.let { sh -> sh.title + ": " + sh.items.take(4).joinToString { (it as? app.aether.ytmusic.Song)?.title ?: it::class.simpleName.orEmpty() } }
        println("phone hl=${hl.ifEmpty { "-" }} gl=${gl.ifEmpty { "-" }}: ${if (r is YtResult.Failure) "REFUSED ${r.error}" else picks}")
    }
}
