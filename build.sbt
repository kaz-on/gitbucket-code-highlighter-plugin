name := "gitbucket-code-highlighter-plugin"
organization := "io.github.gitbucket"
version := "1.8.0"
scalaVersion := "2.13.10"
gitbucketVersion := "4.39.0"

ThisBuild / packageTimestamp := Package.gitCommitDateTimestamp

import scala.sys.process._

def BuildCommand(command: Seq[String]): Seq[String] = {
  val os = sys.props("os.name").toLowerCase
  if (os contains "windows") (Seq("cmd", "/c") ++ command) else command
}

def BuildNpmCommand(command: Seq[String]): Seq[String] = {
  BuildCommand(Seq("npx", "--no-install") ++ command)
}

def ExecCommand(command: Seq[String], builder: (Seq[String]) => Seq[String], log: ProcessLogger): Unit = {
  val ret = Process(builder(command)) ! log
  if(ret != 0)
    throw new MessageOnlyException(s"Failed to run `${command(0)}`")
}

// Compile TypeScript sources
Compile / resourceGenerators += Def.task {
  // Output directory
  val outDir: File = (Compile / resourceManaged).value / "assets"

  // Need to delete the output directory first
  IO.delete(outDir)

  // Run webpack
  val command = Seq("webpack", "--output-path", outDir.getPath)
  ExecCommand(command, BuildNpmCommand, streams.value.log)

  // List all files in 'outDir'
  val finder: PathFinder = (outDir ** "*") filter { _.isFile }
  finder.get
}.taskValue

// Add '@highlightjs/cdn-assets' to resources
Compile / resourceGenerators += Def.task {
  // Source directory
  val sourceDir: File = baseDirectory.value / "node_modules" / "@highlightjs" / "cdn-assets"

  // Output directory
  val outDir: File = (Compile / resourceManaged).value / "cdn-assets"

  // Need to delete the output directory first
  IO.delete(outDir)

  // Copy highlight.js cdn-assets
  IO.copyDirectory(sourceDir, outDir)

  // Delete unused files in highlight.js cdn-assets
  IO.delete(outDir / "es")
  IO.delete(outDir / "highlight.js")
  IO.delete(outDir / "highlight.min.js")
  IO.delete(outDir / "package.json")

  // List all files in 'outDir'
  val finder: PathFinder = (outDir ** "*") filter { _.isFile }
  finder.get
}.taskValue

// Disable renaming of readme and license files
ThisBuild / assemblyMergeStrategy := {
  case PathList(ps @ _*) if Assembly.isReadme(ps.last) || Assembly.isLicenseFile(ps.last) =>
    MergeStrategy.deduplicate
  case x =>
    val oldStrategy = (ThisBuild / assemblyMergeStrategy).value
    oldStrategy(x)
}
