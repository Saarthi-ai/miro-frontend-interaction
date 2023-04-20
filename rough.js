var miro = (() => {
    var Q = Object.defineProperty;
    var Le = (t) => Q(t, "__esModule", { value: !0 }),
        n = (t, e) => Q(t, "name", { value: e, configurable: !0 });
    var ke = (t, e) => {
        Le(t);
        for (var r in e) Q(t, r, { get: e[r], enumerable: !0 });
    };
    var ze = {};
    ke(ze, { board: () => _e, clientVersion: () => Ce });
    var ce = "sdkv2-plugin-message";
    function Me(t) {
        return t.data?.commandId === ce;
    }
    n(Me, "isPluginMessageEvent");
    function Re(t) {
        return t !== null && "window" in t;
    }
    n(Re, "isWindow");
    var N = class {
        constructor(e) {
            this.destroyed = !1;
            this.destroy = n(() => {
                this.clients.forEach((e) => {
                    e.waiting.clear();
                }),
                    this.clients.clear(),
                    this.hostWindow.removeEventListener("message", this.handlePostMessage),
                    (this.destroyed = !0);
            }, "destroy");
            this.createBus = n((e, r) => {
                if (this.destroyed) throw new Error("SdkCommunicationBus: createBus is called on a destroyed instance");
                this.clients.set(e.container, { handler: r, target: e, waiting: new Map() });
                let s = this.dispatch,
                    { destroyBus: o } = this;
                return {
                    target: e,
                    dispatch(i, c) {
                        return s(e.container, i, c);
                    },
                    destroy() {
                        return o(e.container);
                    },
                };
            }, "createBus");
            this.destroyBus = n((e) => {
                let r = this.clients.get(e);
                r && (r.waiting.clear(), this.clients.delete(e));
            }, "destroyBus");
            (this.hostWindow = e),
                (this.clients = new Map()),
                (this.handlePostMessage = this.handlePostMessage.bind(this)),
                (this.dispatch = this.dispatch.bind(this)),
                (this.destroyBus = this.destroyBus.bind(this)),
                this.hostWindow.addEventListener("message", this.handlePostMessage);
        }
        getId() {
            return Math.random().toString(36).slice(-10);
        }
        handlePostMessage(e) {
            if (!Me(e) || !Re(e.source)) return;
            let r = this.clients.get(e.source);
            if (!r || (r.target.origin !== "*" && e.origin !== r.target.origin)) return;
            let { data: s } = e,
                o = r.waiting.get(s.msgId);
            if (o) r.waiting.delete(s.msgId), o.resolve(s.payload);
            else {
                let i = n((c) => {
                    c && this.dispatch(r.target.container, c, s.msgId);
                }, "after");
                r.handler(s.payload).then(i).catch(i);
            }
        }
        dispatch(e, r, s) {
            return new Promise((o, i) => {
                let c = !s,
                    h = this.clients.get(e);
                if (!h) return;
                let S;
                c ? ((S = this.getId()), h.waiting.set(S, { resolve: o, reject: i })) : (S = s);
                let Ae = { commandId: ce, payload: r, msgId: S };
                h.target.container.postMessage(Ae, h.target.origin), !c && s && (h.waiting.delete(s), o(null));
            });
        }
    };
    n(N, "SdkCommunicationBus");
    function le(t) {
        return Object.keys(t);
    }
    n(le, "keys");
    function ue() {
        return Math.random().toString(36).slice(-10);
    }
    n(ue, "getId");
    function ee(t) {
        return t != null && typeof t == "object" && !Array.isArray(t);
    }
    n(ee, "isObject");
    function m(t, ...e) {
        if (!e.length) return t;
        let r = e.shift();
        return (
            ee(t) &&
                ee(r) &&
                Object.keys(r).forEach((s) => {
                    ee(r[s]) ? (t[s] || Object.assign(t, { [s]: {} }), m(t[s], r[s])) : Object.assign(t, { [s]: r[s] });
                }),
            m(t, ...e)
        );
    }
    n(m, "mergeDeep");
    function te(t) {
        let e = {};
        return (
            Object.keys(t).forEach((r) => {
                let s = t[r];
                typeof s != "function" && (e[r] = s);
            }),
            e
        );
    }
    n(te, "asProps");
    var U;
    (function (r) {
        (r.Success = "S"), (r.Fail = "F");
    })(U || (U = {}));
    var H = class {
        constructor({ clientWindow: e = window }) {
            let r = new N(e);
            (this.waitingResponse = new Map()),
                (this.handlers = new Map()),
                (this.responseHandler = this.responseHandler.bind(this)),
                (this.handle = this.handle.bind(this)),
                (this.busDispatcher = r.createBus({ container: e.parent, origin: "*" }, this.handle));
        }
        push(e, r) {
            let s = ue(),
                i = [{ name: e, payload: r, id: s }];
            return new Promise((c, h) => {
                this.waitingResponse.set(s, { resolve: c, reject: h }), this.busDispatcher.dispatch(i).then(this.responseHandler);
            });
        }
        responseHandler(e) {
            let r = e;
            for (let s = 0; s < r.length; s++) {
                let o = r[s];
                if (!o) continue;
                let i = this.waitingResponse.get(o.id);
                i && (o.status === U.Success ? i.resolve(o.payload) : o.status === U.Fail && i.reject(new Error(String(o.payload))), this.waitingResponse.delete(o.id));
            }
            return Promise.resolve([]);
        }
        handle(e) {
            let r = e,
                s = [];
            for (let o = 0; o < r.length; o++) {
                let i = r[o];
                if (i.status) {
                    this.responseHandler([i]);
                    continue;
                }
                let c = this.handlers.get(i.id);
                c &&
                    c.forEach((h) => {
                        s.push(h(i));
                    });
            }
            return Promise.all(s);
        }
        subscribe(e, r) {
            let s = this.handlers.get(e) || [];
            this.handlers.set(e, [...s, r]);
        }
        unsubscribe(e, r) {
            r || this.handlers.delete(e);
            let s = (this.handlers.get(e) || []).filter((o) => o !== r);
            this.handlers.set(e, s);
        }
    };
    n(H, "IframeCommander");
    var Be = n(() => {
            throw new Error("board not initialized");
        }, "boardNotInitialised"),
        ye,
        f = n(() => ye ?? Be(), "board"),
        Oe = n(() => {
            throw new Error("commander not initialized");
        }, "commanderNotInitialised"),
        ge,
        E = n(() => ge ?? Oe(), "commander"),
        he = n((t) => {
            (ye = t.board), (ge = t.commander);
        }, "register");
    async function d(t, e) {
        return e === void 0 ? E().push(t) : E().push(t, e);
    }
    n(d, "runCommand");
    var u = class {
        async sync() {
            return f().sync(this);
        }
        async getMetadata(e) {
            return f().getMetadata(this, e);
        }
        async setMetadata(e, r) {
            return f().setMetadata(this, e, r);
        }
    };
    n(u, "BaseItem");
    var x = class extends u {
        constructor(e) {
            super();
            this.type = "text";
            this.content = "";
            this.style = { fillColor: "transparent", fillOpacity: 1, fontFamily: "arial", fontSize: 14, textAlign: "left", color: "#1a1a1a" };
            m(this, e);
        }
    };
    n(x, "Text");
    var fe;
    (function (a) {
        (a.Rectangle = "rectangle"),
            (a.Circle = "circle"),
            (a.Triangle = "triangle"),
            (a.WedgeRoundRectangleCallout = "wedge_round_rectangle_callout"),
            (a.RoundRectangle = "round_rectangle"),
            (a.Rhombus = "rhombus"),
            (a.Parallelogram = "parallelogram"),
            (a.Star = "star"),
            (a.RightArrow = "right_arrow"),
            (a.LeftArrow = "left_arrow"),
            (a.Pentagon = "pentagon"),
            (a.Hexagon = "hexagon"),
            (a.Octagon = "octagon"),
            (a.Trapezoid = "trapezoid"),
            (a.FlowChartPredefinedProcess = "flow_chart_predefined_process"),
            (a.LeftRightArrow = "left_right_arrow"),
            (a.Cloud = "cloud"),
            (a.LeftBrace = "left_brace"),
            (a.RightBrace = "right_brace"),
            (a.Cross = "cross"),
            (a.Can = "can");
    })(fe || (fe = {}));
    var V;
    (function (p) {
        (p.Gray = "gray"),
            (p.LightYellow = "light_yellow"),
            (p.Yellow = "yellow"),
            (p.Orange = "orange"),
            (p.LightGreen = "light_green"),
            (p.Green = "green"),
            (p.DarkGreen = "dark_green"),
            (p.Cyan = "cyan"),
            (p.LightPink = "light_pink"),
            (p.Pink = "pink"),
            (p.Violet = "violet"),
            (p.Red = "red"),
            (p.LightBlue = "light_blue"),
            (p.Blue = "blue"),
            (p.DarkBlue = "dark_blue"),
            (p.Black = "black");
    })(V || (V = {}));
    var W;
    (function (l) {
        (l.Red = "red"),
            (l.Magenta = "magenta"),
            (l.Violet = "violet"),
            (l.LightGreen = "light_green"),
            (l.Green = "green"),
            (l.DarkGreen = "dark_green"),
            (l.Cyan = "cyan"),
            (l.Blue = "blue"),
            (l.DarkBlue = "dark_blue"),
            (l.Yellow = "yellow"),
            (l.Gray = "gray"),
            (l.Black = "black");
    })(W || (W = {}));
    var I = class extends u {
        constructor(e) {
            super();
            this.type = "sticky_note";
            this.shape = "square";
            this.content = "";
            this.style = { fillColor: V.LightYellow, textAlign: "center", textAlignVertical: "middle" };
            this.tagIds = [];
            m(this, e);
        }
    };
    n(I, "StickyNote");
    var D = class extends u {
        constructor(e) {
            super();
            this.type = "shape";
            this.content = "";
            this.shape = "rectangle";
            this.style = {
                fillColor: "transparent",
                fontFamily: "arial",
                fontSize: 14,
                textAlign: "center",
                textAlignVertical: "middle",
                borderStyle: "normal",
                borderOpacity: 1,
                borderColor: "#1a1a1a",
                borderWidth: 2,
                fillOpacity: 1,
                color: "#1a1a1a",
            };
            m(this, e);
        }
    };
    n(D, "Shape");
    var C = class extends u {
        constructor(e) {
            super();
            this.type = "image";
            this.title = "";
            m(this, e);
        }
    };
    n(C, "Image");
    var T = class extends u {
        constructor(e) {
            super();
            this.type = "card";
            this.title = "";
            this.description = "";
            this.style = {};
            this.dueDate = void 0;
            this.assignee = void 0;
            this.taskStatus = "none";
            this.tagIds = [];
            this.fields = [];
            m(this, e);
        }
    };
    n(T, "Card");
    var _ = class extends u {
        constructor(e) {
            super();
            this.type = "app_card";
            this.owned = !1;
            this.title = "";
            this.description = "";
            this.style = {};
            this.tagIds = [];
            this.status = "disconnected";
            this.fields = [];
            m(this, e);
        }
    };
    n(_, "AppCard");
    var A = class extends u {
        constructor(e) {
            super();
            this.type = "frame";
            this.title = "";
            this.childrenIds = [];
            this.style = { fillColor: "transparent" };
            m(this, e);
        }
        async add(e) {
            return this.childrenIds.push(e.id), await this.sync(), await e.sync(), e;
        }
        async remove(e) {
            let r = e.id;
            if (!r) throw new Error("trying to remove a non-existent item from a frame");
            let s = this.childrenIds.findIndex((o) => o === r);
            if (s === -1) throw new Error(`Can't remove item ${r} from frame ${this.id}. The item is not a current child`);
            this.childrenIds.splice(s, 1), await this.sync(), await e.sync();
        }
        async getChildren() {
            let e = this.childrenIds;
            return e.length === 0 ? [] : f().get({ id: e });
        }
    };
    n(A, "Frame");
    var B = class extends u {
        constructor(e) {
            super();
            this.type = "unsupported";
            m(this, e);
        }
    };
    n(B, "Unsupported");
    var L = class extends u {
        constructor(e) {
            super();
            this.type = "preview";
            m(this, e);
        }
    };
    n(L, "Preview");
    var k = class extends u {
        constructor(e) {
            super();
            this.type = "embed";
            this.previewUrl = "";
            this.mode = "inline";
            m(this, e);
        }
    };
    n(k, "Embed");
    var M = class {
        constructor(e) {
            this.type = "connector";
            this.shape = "curved";
            this.start = void 0;
            this.end = void 0;
            this.style = {};
            this.captions = [];
            m(this, e);
        }
        async sync() {
            return f().sync(this);
        }
        async getMetadata(e) {
            return f().getMetadata(this, e);
        }
        async setMetadata(e, r) {
            return f().setMetadata(this, e, r);
        }
    };
    n(M, "Connector");
    var R = class {
        constructor(e) {
            this.type = "tag";
            this.title = "";
            this.color = W.Red;
            m(this, e);
        }
        async sync() {
            return f().sync(this);
        }
    };
    n(R, "TagEntity");
    function g(t) {
        switch (t.type) {
            case "text":
                return new x(t);
            case "sticky_note":
                return new I(t);
            case "shape":
                return new D(t);
            case "image":
                return new C(t);
            case "frame":
                return new A(t);
            case "preview":
                return new L(t);
            case "card":
                return new T(t);
            case "app_card":
                return new _(t);
            case "embed":
                return new k(t);
            case "connector":
                return new M(t);
            case "tag":
                return new R(t);
            case "document":
            case "mockup":
            case "curve":
            case "webscreen":
            case "usm":
            case "mindmap":
            case "kanban":
            case "table":
            case "svg":
            case "emoji":
            default:
                return new B(t);
        }
    }
    n(g, "convertToSdkFormat");
    var Ge = ["drag", "drop", "dragend", "dragstart"],
        Fe = { "pointer-events": "none", "user-select": "none", "-webkit-user-select": "none", "-webkit-touch-callout": "none" },
        q = class {
            constructor() {
                this.listeners = [];
                this.originalBodyStyle = {};
                this.dragStartPosition = { x: -1 / 0, y: -1 / 0 };
            }
            setDragStartPosition(e, r) {
                this.dragStartPosition = { x: e, y: r };
            }
            shouldDispatchDrag(e, r) {
                return Math.abs(e - this.dragStartPosition.x) > q.DRAG_THRESHOLD || Math.abs(r - this.dragStartPosition.y) > q.DRAG_THRESHOLD;
            }
            addListener(e, r, s) {
                this.listeners.push({ type: e, selector: r, handler: s });
            }
            removeListener(e, r, s) {
                this.listeners = this.listeners.filter((o) => o.type !== e || (r != null && o.selector !== r) || (s != null && o.handler !== s));
            }
            isDraggableElement(e) {
                return !(e instanceof HTMLElement) && !(e instanceof SVGElement) ? !1 : this.listeners.some(({ selector: r }) => !!e.closest(r));
            }
            disableClickEvents() {
                Object.entries(Fe).forEach(([e, r]) => {
                    (this.originalBodyStyle[e] = document.body.style.getPropertyValue(e)), document.body.style.setProperty(e, r);
                });
            }
            restoreClickEvents() {
                Object.entries(this.originalBodyStyle).forEach(([e, r]) => {
                    document.body.style.setProperty(e, r);
                }),
                    (this.originalBodyStyle = {});
            }
            dragEnd(e) {
                this.dispatch("dragend", { target: e, clientX: NaN, clientY: NaN, screenX: NaN, screenY: NaN });
            }
            dispatch(e, r) {
                this.listeners.forEach(({ selector: s, handler: o, type: i }) => {
                    if (e !== i) return;
                    let c = r.target.closest(s);
                    if (!c) return;
                    let h = new CustomEvent(e, { detail: { ...r, target: c, type: e } });
                    o(h);
                });
            }
        },
        O = q;
    n(O, "BaseDragSensor"), (O.DRAG_THRESHOLD = 8);
    var re = class extends O {
        constructor() {
            super();
            this.isDragging = !1;
            this.onMouseDown = n((e) => {
                let r = e.target;
                !this.isDraggableElement(r) ||
                    ((this.target = r), this.setDragStartPosition(e.clientX, e.clientY), window.addEventListener("mouseup", this.onMouseUp), document.addEventListener("mousemove", this.onMouseMove, { passive: !0 }));
            }, "onMouseDown");
            this.onMouseMove = n((e) => {
                if (!this.target) return;
                let { clientX: r, clientY: s, screenX: o, screenY: i } = e;
                if (!this.isDragging && !this.shouldDispatchDrag(r, s)) return;
                let c = this.isDragging ? "drag" : "dragstart";
                this.isDragging || this.disableClickEvents(), (this.isDragging = !0), this.dispatch(c, { target: this.target, clientX: r, clientY: s, screenX: o, screenY: i });
            }, "onMouseMove");
            this.onMouseUp = n((e) => {
                if (this.isDragging && this.target) {
                    let { clientX: r, clientY: s, screenX: o, screenY: i } = e;
                    this.dispatch("drop", { target: this.target, clientX: r, clientY: s, screenX: o, screenY: i });
                }
                this.resetDragging();
            }, "onMouseUp");
            this.resetDragging = n(() => {
                window.removeEventListener("mouseup", this.onMouseUp),
                    document.removeEventListener("mousemove", this.onMouseMove),
                    this.isDragging && this.target && this.dragEnd(this.target),
                    this.target && this.restoreClickEvents(),
                    (this.isDragging = !1),
                    (this.target = void 0);
            }, "resetDragging");
            document.addEventListener("mousedown", this.onMouseDown), window.addEventListener("blur", this.resetDragging);
        }
    };
    n(re, "MouseDragSensor");
    var Se = 100,
        G = !1;
    window.addEventListener(
        "touchmove",
        (t) => {
            !G || t.preventDefault();
        },
        { passive: !1 }
    );
    var se = class extends O {
        constructor() {
            super();
            this.onTouchStart = n((e) => {
                let { target: r } = e;
                if (!this.isDraggableElement(r)) return;
                let { clientX: s, clientY: o, screenX: i, screenY: c } = e.touches[0];
                this.setDragStartPosition(s, o),
                    (this.target = r),
                    (this.tapTimeout = window.setTimeout(() => {
                        this.startDragging({ target: r, clientX: s, clientY: o, screenX: i, screenY: c });
                    }, Se)),
                    window.addEventListener("touchend", this.onTouchEnd),
                    window.addEventListener("touchcancel", this.resetDragging),
                    window.addEventListener("touchmove", this.resetDragging);
            }, "onTouchStart");
            this.onTouchMove = n((e) => {
                if (!this.target) return;
                let { clientX: r, clientY: s, screenX: o, screenY: i } = e.touches[0];
                this.dispatch("drag", { target: this.target, clientX: r, clientY: s, screenX: o, screenY: i });
            }, "onTouchMove");
            this.onTouchEnd = n((e) => {
                if (G && this.target) {
                    let { clientX: s, clientY: o, screenX: i, screenY: c } = e.changedTouches[0];
                    this.dispatch("drop", { target: this.target, clientX: s, clientY: o, screenX: i, screenY: c });
                }
                this.resetDragging();
            }, "onTouchEnd");
            this.startDragging = n((e) => {
                !this.shouldDispatchDrag(e.clientX, e.clientY) ||
                    (window.removeEventListener("touchmove", this.resetDragging), window.addEventListener("touchmove", this.onTouchMove, { passive: !0 }), (G = !0), this.disableClickEvents(), this.dispatch("dragstart", e));
            }, "startDragging");
            this.resetDragging = n(() => {
                window.removeEventListener("touchend", this.onTouchEnd),
                    window.removeEventListener("touchcancel", this.resetDragging),
                    window.removeEventListener("touchmove", this.resetDragging),
                    window.removeEventListener("touchmove", this.onTouchMove),
                    G && this.target && (this.restoreClickEvents(), this.dragEnd(this.target)),
                    (this.target = void 0),
                    (G = !1),
                    this.tapTimeout !== void 0 && (clearTimeout(this.tapTimeout), (this.tapTimeout = void 0));
            }, "resetDragging");
            window.addEventListener("touchstart", this.onTouchStart), window.addEventListener("blur", this.resetDragging);
        }
    };
    n(se, "TouchDragSensor");
    var Y = class {
        constructor(e) {
            (this.touchSensor = new se()), (this.mouseSensor = new re()), Object.assign(this, e);
        }
        addListener(e, r) {
            this.mouseSensor.addListener(e, this.selector, r), this.touchSensor.addListener(e, this.selector, r);
        }
        removeListener(e, r) {
            this.mouseSensor.removeListener(e, void 0, r), this.touchSensor.removeListener(e, void 0, r);
        }
        reset() {
            Ge.forEach((e) => {
                this.mouseSensor.removeListener(e), this.touchSensor.removeListener(e);
            });
        }
    };
    n(Y, "DragSensor");
    var b,
        ve = n(() => {
            b?.reset(), (b = new Y({ selector: ".miro-draggable" }));
        }, "initDragSensor");
    function Ne() {
        return async (t) => {
            let { clientX: e, clientY: r } = t.detail;
            await d("UI_DRAG_START", { clientX: e, clientY: r, dragImage: void 0 });
        };
    }
    n(Ne, "onDragStart");
    function Ue() {
        let t;
        return (e) => {
            if (t) return;
            t = requestAnimationFrame(() => {
                t = void 0;
            });
            let { clientX: r, clientY: s } = e.detail;
            d("UI_DRAG_MOVE", { clientX: r, clientY: s });
        };
    }
    n(Ue, "onDrag");
    function He(t) {
        return async (e) => {
            let { target: r, clientX: s, clientY: o } = e.detail,
                i = await d("UI_DRAG_DROP", { clientX: s, clientY: o });
            if (i == null) return;
            let { x: c, y: h } = i;
            t({ x: c, y: h, target: r });
        };
    }
    n(He, "onDrop");
    function Ve() {
        return async () => {
            await d("UI_DRAG_END");
        };
    }
    n(Ve, "onDragEnd");
    async function We(t) {
        await E().push("UI_REGISTER_EVENT", { name: t });
    }
    n(We, "registerEventListener");
    async function Ye(t) {
        await E().push("UI_UNREGISTER_EVENT", { name: t });
    }
    n(Ye, "unregisterEventListener");
    var ne = "icon:click",
        oe = "app_card:open",
        ie = "app_card:connect",
        ae = "selection:update",
        X = "items:create",
        j = "items:delete",
        z = "experimental:items:update",
        qe = "custom:",
        we = n((t) => t.startsWith(qe), "isCustomEvent"),
        de = class {
            constructor() {
                this.listeners = { [ne]: [], [oe]: [], [ie]: [], [ae]: [], [X]: [], [z]: [], [j]: [] };
            }
            async addListener(e, r) {
                this.listeners[e] || (this.listeners[e] = []);
                let s = this.listeners[e];
                if ((s.push(r), s.length === 1)) return We(e);
            }
            async removeListener(e, r) {
                if (((this.listeners[e] = this.listeners[e].filter((s) => s !== r)), this.listeners[e].length === 0)) return Ye(e);
            }
            listen() {
                le(this.listeners).forEach((e) => {
                    E().unsubscribe(e),
                        E().subscribe(e, async (r) => {
                            this.listeners[e].forEach((s) => s(r));
                        });
                });
            }
        };
    n(de, "AppManager");
    var y = { drop: new Map(), "app_card:connect": new Map(), "app_card:open": new Map(), "icon:click": new Map(), "selection:update": new Map(), [X]: new Map(), [z]: new Map(), [j]: new Map() };
    function P(t, e, r) {
        return y[t] || (y[t] = new Map()), y[t].set(e, r), r;
    }
    n(P, "linkEventHandlerToListener");
    function pe(t, e) {
        let r = y[t],
            s = r.get(e);
        return r.delete(e), s;
    }
    n(pe, "getListenerByEventHandler");
    var v = new de();
    function Xe(t) {
        y.drop.size === 0 && ((y.dragstart = Ne()), (y.drag = Ue()), (y.dragend = Ve()), b.addListener("dragstart", y.dragstart), b.addListener("drag", y.drag), b.addListener("dragend", y.dragend)),
            b.addListener("drop", P("drop", t, He(t)));
    }
    n(Xe, "attachDragAndDropListeners");
    function je(t) {
        b.removeListener("drop", pe("drop", t)), y.drop.size === 0 && (b.removeListener("dragstart", y.dragstart), b.removeListener("drag", y.drag), b.removeListener("dragend", y.dragend));
    }
    n(je, "detachDragAndDropListeners");
    function be(t, e) {
        switch (t) {
            case "drop":
                return Xe(e), Promise.resolve();
            case ne:
                return v.addListener(
                    t,
                    P(t, e, async () => e())
                );
            case oe:
                return v.addListener(
                    t,
                    P(t, e, async (r) => {
                        let { appCard: s } = r.payload,
                            o = { appCard: g(s) };
                        e(o);
                    })
                );
            case ie:
                return v.addListener(
                    t,
                    P(t, e, async (r) => {
                        let { appCard: s } = r.payload,
                            o = { appCard: g(s) };
                        e(o);
                    })
                );
            case ae:
                return v.addListener(
                    t,
                    P(t, e, async (r) => {
                        let { items: s } = r.payload,
                            o = { items: s.map((i) => g(i)) };
                        e(o);
                    })
                );
            case X:
                return v.addListener(
                    t,
                    P(t, e, async (r) => {
                        let { items: s } = r.payload,
                            o = { items: s.map((i) => g(i)) };
                        e(o);
                    })
                );
            case z:
                return v.addListener(
                    t,
                    P(t, e, async (r) => {
                        let { items: s } = r.payload,
                            o = { items: s.map((i) => g(i)) };
                        e(o);
                    })
                );
            case j:
                return v.addListener(
                    t,
                    P(t, e, async (r) => {
                        let { items: s } = r.payload,
                            o = { items: s.map((i) => g(i)) };
                        e(o);
                    })
                );
            default:
                if (we(t)) {
                    let r = n(async (s) => {
                        let { items: o } = s.payload,
                            i = { items: o.map((c) => g(c)) };
                        e(i);
                    }, "internalHandler");
                    return E().subscribe(t, r), P(t, e, r), v.addListener(t, r);
                }
                throw new Error(`unknown event: ${t}`);
        }
    }
    n(be, "on");
    function Ee(t, e) {
        switch (t) {
            case "drop":
                return je(e), Promise.resolve();
            case ne:
            case oe:
            case ie:
            case ae:
            case X:
            case z:
            case j:
                return v.removeListener(t, pe(t, e));
            default:
                if (we(t)) {
                    let r = pe(t, e);
                    return E().unsubscribe(t, r), v.removeListener(t, r);
                }
                throw new Error(`unknown event: ${t}`);
        }
    }
    n(Ee, "off");
    var $ = class {
        constructor() {
            this.on = be;
            this.off = Ee;
        }
        async openPanel(e) {
            await d("UI_OPEN_PANEL", e);
        }
        async closePanel() {
            await d("UI_CLOSE_PANEL");
        }
        async openModal(e) {
            await d("UI_OPEN_MODAL", e);
        }
        async closeModal() {
            await d("UI_CLOSE_MODAL");
        }
    };
    n($, "BoardUI");
    var Pe;
    (function (t) {
        (t.Red = "red"),
            (t.Magenta = "magenta"),
            (t.Violet = "violet"),
            (t.LightGreen = "light_green"),
            (t.Green = "green"),
            (t.DarkGreen = "dark_green"),
            (t.Cyan = "cyan"),
            (t.Blue = "blue"),
            (t.DarkBlue = "dark_blue"),
            (t.Yellow = "yellow"),
            (t.Gray = "gray"),
            (t.Black = "black");
    })(Pe || (Pe = {}));
    var xe;
    (function (t) {
        (t.Gray = "gray"),
            (t.LightYellow = "light_yellow"),
            (t.Yellow = "yellow"),
            (t.Orange = "orange"),
            (t.LightGreen = "light_green"),
            (t.Green = "green"),
            (t.DarkGreen = "dark_green"),
            (t.Cyan = "cyan"),
            (t.LightPink = "light_pink"),
            (t.Pink = "pink"),
            (t.Violet = "violet"),
            (t.Red = "red"),
            (t.LightBlue = "light_blue"),
            (t.Blue = "blue"),
            (t.DarkBlue = "dark_blue"),
            (t.Black = "black");
    })(xe || (xe = {}));
    var Ie;
    (function (t) {
        (t.Rectangle = "rectangle"), (t.Circle = "circle"), (t.Triangle = "triangle"), t.WedgeRound;
        (RectangleCallout = "wedge_round_rectangle_callout"),
            (t.RoundRectangle = "round_rectangle"),
            (t.Rhombus = "rhombus"),
            (t.Parallelogram = "parallelogram"),
            (t.Star = "star"),
            (t.RightArrow = "right_arrow"),
            (t.LeftArrow = "left_arrow"),
            (t.Pentagon = "pentagon"),
            (t.Hexagon = "hexagon"),
            (t.Octagon = "octagon"),
            (t.Trapezoid = "trapezoid"),
            (t.FlowChartPredefinedProcess = "flow_chart_predefined_process"),
            (t.LeftRightArrow = "left_right_arrow"),
            (t.Cloud = "cloud"),
            (t.LeftBrace = "left_brace"),
            (t.RightBrace = "right_brace"),
            (t.Cross = "cross"),
            (t.Can = "can");
    })(Ie || (Ie = {}));
    var F;
    (function (t) {
        (t.Error = "error"), (t.Info = "info");
    })(F || (F = {}));
    var me = "SHOW_NOTIFICATION",
        Z = class {
            async showInfo(e) {
                let r = { message: e, type: F.Info };
                await d(me, r);
            }
            async showError(e) {
                let r = { message: e, type: F.Error };
                await d(me, r);
            }
            async show(e) {
                await d(me, e);
            }
        };
    n(Z, "Notifications");
    var K = class {
        constructor() {}
        async get() {
            return await d("VIEWPORT_GET");
        }
        async set(e) {
            return await d("VIEWPORT_SET", e);
        }
        async zoomTo(e) {
            return Array.isArray(e) ? d("VIEWPORT_ZOOM_TO", { items: e.map((r) => r.id) }) : this.zoomTo([e]);
        }
        async getZoom() {
            return await d("VIEWPORT_GET_ZOOM");
        }
        async setZoom(e) {
            return await d("VIEWPORT_SET_ZOOM", { zoomLevel: e });
        }
    };
    n(K, "Viewport");
    async function De(t, e) {
        return m(e, t), e;
    }
    n(De, "mergeResponse");
    async function w(t) {
        let e = te(t);
        return d("WIDGET_CREATE", e).then((r) => De(r, t));
    }
    n(w, "add");
    var J = class {
        constructor() {
            this.ui = new $();
            this.notifications = new Z();
            this.viewport = new K();
        }
        async createCard(e) {
            return w(new T(e));
        }
        async createAppCard(e) {
            return w(new _(e));
        }
        async createFrame(e) {
            return w(new A(e));
        }
        async createImage(e) {
            return w(new C(e));
        }
        async createPreview(e) {
            return w(new L(e));
        }
        async createShape(e) {
            return w(new D(e));
        }
        async createStickyNote(e) {
            return w(new I(e));
        }
        async createText(e) {
            return w(new x(e));
        }
        async createEmbed(e) {
            return w(new k(e));
        }
        async createConnector(e) {
            return w(new M(e));
        }
        async createTag(e) {
            return w(new R(e));
        }
        async sync(e) {
            let r = te(e);
            return d("WIDGET_UPDATE", r).then((s) => {
                De(s, e);
            });
        }
        async remove(e) {
            let { id: r, type: s } = e;
            await d("WIDGET_REMOVE", { id: r, type: s });
        }
        bringToFront(e) {
            return Array.isArray(e) ? d("BRING_TO_FRONT", { items: e.map((r) => r.id) }) : this.bringToFront([e]);
        }
        sendToBack(e) {
            return Array.isArray(e) ? d("SEND_TO_BACK", { items: e.map((r) => r.id) }) : this.sendToBack([e]);
        }
        async getById(e) {
            let r = await this.get({ id: e });
            if (Array.isArray(r) && r.length) return g(r[0]);
            throw new Error(`Can not retrieve item with id ${e}`);
        }
        async get(e) {
            let r = await d("WIDGET_GET", e);
            if (!Array.isArray(r)) throw new Error("Error retrieving items");
            return r.map(g);
        }
        async getInfo() {
            return d("GET_BOARD_INFO");
        }
        async getUserInfo() {
            return d("GET_USER_INFO");
        }
        async getSelection() {
            return (await d("GET_SELECTION")).map(g);
        }
        async select(e) {
            return (await d("SELECT_WIDGETS", e)).map(g);
        }
        async deselect(e) {
            return (await d("DESELECT_WIDGETS", e)).map(g);
        }
        async getAppData(e) {
            return await d("GET_BOARD_APP_DATA", { key: e });
        }
        async setAppData(e, r) {
            return await d("SET_BOARD_APP_DATA", { key: e, value: r });
        }
        async setMetadata(e, r, s) {
            let o = e.id;
            return await d("WIDGET_SET_METADATA", { itemId: o, key: r, value: s });
        }
        async getMetadata(e, r) {
            let s = e.id;
            return await d("WIDGET_GET_METADATA", { itemId: s, key: r });
        }
        async getIdToken() {
            return await d("GET_ID_TOKEN");
        }
    };
    n(J, "Board");
    var Ce = "1.44540.0",
        Te = new H({ clientWindow: window }),
        _e = new J();
    he({ commander: Te, board: _e });
    Te.push("handshake", { clientVersion: Ce });
    ve();
    v.listen();
    new URLSearchParams(location.search).has("autotest") && console.log("SDKv2 loaded for client version: 1.44540.0 and git commit: 7a2b578e2ba54a35055d9e0026cefeff5b6f523b");
    return ze;
})();
