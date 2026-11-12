package app.aether.sources.addon

import app.aether.core.model.MediaId
import app.aether.core.model.Outcome
import kotlinx.coroutines.runBlocking
import okhttp3.OkHttpClient
import okhttp3.Request

/**
 * Adds an addon by its address and tries it the way AETHER does, live (`./gradlew :sources:addon:addonCheck -Paddress=… -Pq=…`):
 * the manifest, a search, and the first song's stream (only its first bytes are asked for).
 */
fun main(args: Array<String>) = runBlocking {
    val options = args.associate { it.substringBefore('=') to it.substringAfter('=', "") }
    val address = options["address"] ?: return@runBlocking println("give -Paddress=")
    val http = OkHttpClient.Builder().addInterceptor { c -> c.proceed(c.request().newBuilder().header("User-Agent", "AETHER/2.2 (Android music player)").build()) }.build()
    // The manifest asked plainly first, so a failure shows what it is.
    val manifestUrl = AddonSource.base(address)!!.newBuilder().addPathSegment("manifest.json").build()
    println("asking $manifestUrl")
    runCatching {
        http.newCall(Request.Builder().url(manifestUrl).header("Accept", "application/json").build()).execute().use { r -> println("  plain: HTTP ${r.code} ${r.protocol} ${r.body?.string()?.take(80)}") }
    }.onFailure { println("  plain: ${it::class.simpleName}: ${it.message}") }
    val source = when (val r = AddonSource.connect(address, http)) {
        is Outcome.Ok -> r.value.also { println("added: ${it.name} (${it.manifest.id}), settings ${it.manifest.settings.map { s -> s.key + "=" + s.default }}, asks with ${it.manifest.query(emptyMap())}") }
        is Outcome.Err -> return@runBlocking println("not added: ${r.error}")
    }
    val query = options["q"]?.ifBlank { null } ?: "Adele Hello"
    val found = source.search(query, null)
    if (found !is Outcome.Ok) return@runBlocking println("search \"$query\": ${(found as Outcome.Err).error}; trouble=${source.trouble}")
    println("search \"$query\": ${found.value.items.size} results")
    found.value.items.take(3).forEach { println("  ${it}") }
    val first = found.value.items.filterIsInstance<app.aether.core.model.Track>().firstOrNull() ?: return@runBlocking
    when (val s = source.stream(first.id, false)) {
        is Outcome.Ok -> {
            val v = s.value
            println("stream: ${v.manifest} ${v.mimeType} ${v.codec} ${v.sampleRateHz} Hz ${v.bitDepth} bit, expires ${v.expiresAtMs}")
            val head = http.newCall(Request.Builder().url(v.url).header("Range", "bytes=0-15").apply { v.headers.forEach { (k, x) -> header(k, x) } }.build()).execute().use { r -> "HTTP ${r.code} ${r.header("Content-Type")} first bytes ${r.body?.bytes()?.take(4)?.joinToString(" ") { "%02x".format(it) }}" }
            println("  its address answers: $head")
        }
        is Outcome.Err -> println("stream: ${s.error}")
    }
}
