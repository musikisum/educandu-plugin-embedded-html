class EmbeddedHtmlController {
  handleGetServerTime(_req, res) {
    return res.send({ time: new Date() });
  }

  registerMiddleware(router) {
    router.get(
      '/api/v1/plugin/musikisum/educandu-plugin-embedded-html/time',
      (req, res) => this.handleGetServerTime(req, res)
    );
  }
}

export default EmbeddedHtmlController;
