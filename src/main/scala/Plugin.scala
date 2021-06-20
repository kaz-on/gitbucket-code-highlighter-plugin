import javax.servlet.ServletContext
import gitbucket.core.plugin.PluginRegistry
import gitbucket.core.service.SystemSettingsService.SystemSettings
import io.github.gitbucket.solidbase.model.Version

class Plugin extends gitbucket.core.plugin.Plugin {
  override val pluginId: String = "code-highlighter"
  override val pluginName: String = "Code Highlighter Plugin"
  override val description: String = "Enhance code syntax highlighting using highlight.js"
  override val versions: List[Version] = List(
    new Version("1.0.0"),
    new Version("1.0.1"),
    new Version("1.1.0"),
    new Version("1.1.1")
  )

  override val assetsMappings = Seq(
    "/code-highlighter/highlightjs" -> "/cdn-assets",
    "/code-highlighter" -> "/assets"
  )

  override def javaScripts(registry: PluginRegistry, context: ServletContext, settings: SystemSettings): Seq[(String, String)] = {
    val basePath = settings.baseUrl.getOrElse(context.getContextPath)
    val assetsPath = basePath + "/plugin-assets/code-highlighter"
    Seq(".*" -> s"""
      |codeHighlighterAssetsPath = "${assetsPath}";
      |</script>
      |<script src="${assetsPath}/highlightjs/highlight.min.js" defer></script>
      |<script src="${assetsPath}/main.js" defer></script>
      |<script>""".stripMargin)
  }
}
