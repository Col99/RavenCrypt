var routes = {};

var routePath = __dirname + "/routes/";
function route(path){
    return require(routePath + path);
}

routes.blog = route("routeBlog.js");
routes.com = route("routeCom.js");
routes.contact = route("routeContact.js");
routes.contactKey = route("routeContactKey.js");
routes.exist = route("routeExists.js");
routes.file = route("routeFile.js");
routes.index = route("routeIndex.js");
routes.keys = route("routeKeys.js");
routes.login = route("routeLogin.js");
routes.msg = route("routeMsg.js");
routes.profie = route("routeProfile");
routes.register = route("routeRegister.js");
routes.relation = route("routeRelation.js");

module.exports = routes;