package app.aether.update

import android.content.Intent
import java.io.File
import kotlin.test.assertEquals
import kotlin.test.assertIs
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.test.TestScope
import kotlinx.coroutines.test.advanceUntilIdle
import kotlinx.coroutines.test.runTest
import org.junit.Test

/** The look for a newer AETHER as the app comes to the front: afresh once a launch, then remembered. */
@OptIn(ExperimentalCoroutinesApi::class)
class UpdateCheckTest {
    private val newer = """{"tag_name":"v9.0.0","html_url":"https://github.com/GHOSTxASR/AETHER/releases/tag/v9.0.0","body":"","draft":false,"prerelease":false,"assets":[]}"""

    private class Net(private val answer: String) : UpdateNet {
        var asked = 0
        override suspend fun text(url: String): String {
            asked++
            return answer
        }
        override suspend fun download(url: String, to: File, onProgress: (Long, Long?) -> Unit) = Unit
    }

    private class Store(override var lastAnswer: String?, override var lastCheckedAt: Long) : UpdateStore {
        override var automatic = true
        override var ignoredTag: String? = null
        override var remindAfter = 0L
    }

    private object Installer : UpdateInstaller {
        override fun allowed() = true
        override fun permissionPage() = Intent()
        override fun inspect(file: File) = ApkCheck.UPDATE
        override fun install(file: File) = Unit
    }

    private fun TestScope.center(net: Net, store: Store, clock: Long) = UpdateCenter(
        net = net,
        store = store,
        installer = Installer,
        current = Version.of("2.3.0")!!,
        downloads = File("build/tmp"),
        scope = this,
        now = { clock },
        checksByItself = true,
        canInstallReleases = false,
    )

    @Test
    fun theFirstLookOfALaunchAsksGitHubEvenWithARecentAnswerKept() = runTest {
        val clock = 10 * 60 * 60_000L
        // An answer an hour old says there's nothing newer; a release has come out since.
        val store = Store(lastAnswer = """{"tag_name":"v2.3.0","html_url":"https://github.com/x/y","draft":false,"prerelease":false}""", lastCheckedAt = clock - 60 * 60_000L)
        val net = Net(newer)
        val updates = center(net, store, clock)
        updates.autoCheck()
        advanceUntilIdle()
        assertEquals(1, net.asked)
        assertIs<UpdateState.Offer>(updates.state.value)
    }

    @Test
    fun laterLooksInTheSameLaunchUseWhatItWasTold() = runTest {
        val clock = 10 * 60 * 60_000L
        val store = Store(lastAnswer = null, lastCheckedAt = 0L)
        val net = Net("""{"tag_name":"v2.3.0","html_url":"https://github.com/x/y","draft":false,"prerelease":false}""")
        val updates = center(net, store, clock)
        updates.autoCheck()
        advanceUntilIdle()
        updates.autoCheck()
        advanceUntilIdle()
        assertEquals(1, net.asked)
    }

    @Test
    fun auraReleaseParsesMultiApkAssetsAndSummaryAndOffersInstall() = runTest {
        val digest = "a".repeat(64)
        val payload = """
            {
              "tag_name": "v3.1.1",
              "html_url": "https://github.com/vampireanshuman/Aura-Music/releases/tag/v3.1.1",
              "body": "**Aura Music 3.1.1** restores one-tap in-app updates.\n\n### Fixed\n- **In-app updates:** Restored direct APK installation.\n- **Release notes:** Parsed Aura summaries.",
              "draft": false,
              "prerelease": false,
              "assets": [
                {"name": "AuraMusic-release.apk", "browser_download_url": "https://github.com/vampireanshuman/Aura-Music/releases/download/v3.1.1/AuraMusic-release.apk", "size": 100, "digest": "sha256:$digest"},
                {"name": "Aura-Music-v3.1.1.apk", "browser_download_url": "https://github.com/vampireanshuman/Aura-Music/releases/download/v3.1.1/Aura-Music-v3.1.1.apk", "size": 200, "digest": "sha256:$digest"},
                {"name": "Aura-v3.1.1.apk", "browser_download_url": "https://github.com/vampireanshuman/Aura-Music/releases/download/v3.1.1/Aura-v3.1.1.apk", "size": 300, "digest": "sha256:$digest"}
              ]
            }
        """.trimIndent()
        assertEquals("com.auramusic.app", UpdateCenter.RELEASE_PACKAGE)
        val parsed = Releases.parse(payload)
        assertEquals("Aura-Music-v3.1.1.apk", parsed?.apk?.name)
        assertEquals(digest, parsed?.apk?.sha256)
        assertEquals(
            listOf("Aura Music 3.1.1 restores one-tap in-app updates.", "In-app updates", "Release notes"),
            ReleaseNotes.short(parsed!!.notes),
        )

        val updates = UpdateCenter(
            net = Net(payload),
            store = Store(lastAnswer = null, lastCheckedAt = 0L),
            installer = Installer,
            current = Version.of("3.1.0")!!,
            downloads = File("build/tmp"),
            scope = this,
            now = { 1000L },
            checksByItself = true,
            canInstallReleases = true,
        )
        updates.checkNow()
        advanceUntilIdle()
        val offer = assertIs<UpdateState.Offer>(updates.state.value)
        assertEquals(true, offer.canInstall)
        assertEquals("Aura-Music-v3.1.1.apk", offer.release.apk?.name)
    }
}
