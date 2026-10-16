tasks.register<Exec>("npmLint") {
  commandLine("npm", "run", "lint")
}

tasks.register<Exec>("npmBuild") {
  commandLine("npm", "run", "build")
}

tasks.register("lint") {
  dependsOn("npmLint")
}

tasks.register("compileDebugKotlin") {
  dependsOn("npmLint")
}

tasks.register("assembleDebug") {
  dependsOn("npmBuild")
}
