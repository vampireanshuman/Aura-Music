import org.jetbrains.kotlin.gradle.dsl.JvmTarget

// Sources the listener adds by address, speaking PODIUM's and LastWave's addon protocol. Open media only.
plugins {
    alias(libs.plugins.kotlin.jvm)
    alias(libs.plugins.kotlin.serialization)
}

java {
    sourceCompatibility = JavaVersion.VERSION_17
    targetCompatibility = JavaVersion.VERSION_17
}

kotlin {
    compilerOptions { jvmTarget.set(JvmTarget.JVM_17) }
}

dependencies {
    api(project(":core:model"))
    // The recording matcher's title and artist rules (PODIUM's normaliser), shared with the lyrics.
    implementation(project(":core:lyrics"))
    implementation(libs.kotlinx.coroutines.core)
    implementation(libs.kotlinx.serialization.json)
    implementation(libs.okhttp)
    testImplementation(libs.junit)
    testImplementation(libs.kotlin.test)
}

// Adds an addon by its address and tries it as AETHER does, live: -Paddress=https://… -Pq="song artist"
tasks.register<JavaExec>("addonCheck") {
    group = "verification"
    classpath = sourceSets["test"].runtimeClasspath
    mainClass.set("app.aether.sources.addon.AddonCheckKt")
    args = listOf("address", "q").mapNotNull { name -> project.findProperty(name)?.let { "$name=$it" } }
}
