name := "gitbucket-code-highlighter-plugin"
organization := "io.github.gitbucket"
version := "1.1.0"
scalaVersion := "2.13.3"
gitbucketVersion := "4.35.3"

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
  // Lint
  ExecCommand(Seq("eslint", "src"), BuildNpmCommand, streams.value.log)

  // Source directory
  val sourceDir: File = (Compile / sourceDirectory).value / "typescript"

  // Output directory
  val outDir: File = (Compile / resourceManaged).value / "assets"

  // Need to delete the output directory first
  IO.delete(outDir)

  // Run tsc
  val command = Seq("tsc", "--project", sourceDir.getPath, "--outDir", outDir.getPath)
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

  // Copy highlight.js cdn-assets
  IO. copyDirectory(sourceDir, outDir, true)

  // List all files in 'outDir'
  val finder: PathFinder = (outDir ** "*") filter { _.isFile }
  finder.get
}.taskValue
