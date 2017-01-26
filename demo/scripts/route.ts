export interface IRoute {
    url: string;
    view: string;
    cb: () => void;
}

export default function(routes: IRoute[]) {
    const app = $.sammy(function() {
        if (routes) {
            routes.forEach(route => {
                this.get(route.url, () => {
                    $("#content").load("demo/views/" + route.view + ".html", () => {
                        route.cb();
                    });
                });
            });
        }
    });

    $(function() {
        app.run();
    });
}
