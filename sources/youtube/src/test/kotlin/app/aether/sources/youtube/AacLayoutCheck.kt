package app.aether.sources.youtube

import kotlinx.coroutines.runBlocking
import okhttp3.OkHttpClient
import java.io.File

/** Saves the opening of a song's AAC copy (`./gradlew :sources:youtube:aacLayoutCheck -Pids=...`), to read its boxes. */
fun main(args: Array<String>) = runBlocking {
    val options = args.associate { it.substringBefore('=') to it.substringAfter('=', "") }
    val resolver = YouTubeStreamResolver(OkHttpClient(), region = { "IN" })
    val id = options["ids"]?.ifBlank { null } ?: "GpDhsfSQVeE"
    val head = resolver.diagnoseAacHead(id, options["bytes"]?.toIntOrNull() ?: 400_000) ?: return@runBlocking println("no AAC copy served for $id")
    val out = File(options["out"]?.ifBlank { null } ?: "aac-head.m4a")
    out.writeBytes(head)
    println("${head.size} bytes of $id's AAC copy -> ${out.absolutePath}")
}
