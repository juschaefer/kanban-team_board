/**
 * @overview ccm component for kanban board
 * @author André Kless <andre.kless@web.de> 2016-2018
 * @license The MIT License (MIT)
 * @version latest (2.0.0)
 * @changes
 * version 2.0.0 (01.11.2018)
 * - uses ccm v18.2.0
 * - removed privatization of instance members
 * - changed config parameters
 * - changed logging behaviour
 * - added onchange callback
 * - added getValue() method
 * version 1.2.0 (11.11.2017):
 * - add logging support
 * version 1.1.0 (10.11.2017):
 * - confirm dialog when deleting a card
 * version 1.0.0 (29.10.2017)
 */

(function () {

    const component = {

        name: 'kanban_team_board',

        //ccm: 'https://ccmjs.github.io/ccm/ccm.js',
        ccm: 'https://ccmjs.github.io/ccm/versions/ccm-18.2.0.js',

        config: {

            kanban: ['ccm.component', 'http://kaul.inf.h-brs.de/data/ccm/kanban_board/versions/ccm.kanban_board-1.0.0.js'],
            user: ["ccm.instance", "https://ccmjs.github.io/akless-components/user/versions/ccm.user-8.3.1.js", ["ccm.get", "https://ccmjs.github.io/akless-components/user/resources/configs.js", "guest"]],
            // teamstore: {
            //     "store": ["ccm.store", {name: 'teambuild', url: 'http://192.168.99.101:8080'}],
            //     "key": "sose_19"
            // },

            html: {
                "main": {"id": "kanban_board"},
                "lanes": {"id": "lanes"},
                "lane": {
                    "class": "lane",
                    "inner": [
                        {
                            "class": "title",
                            "inner": "%%"
                        },
                        {
                            "class": "cards",
                            // "inner": "%%"
                        }
                    ]
                },
                "user":
                    {
                        "class": "user",
                        // "inner": "%username%"
                    },
                "username": {
                    "class": "username",
                    "inner": "%username%"
                },
                "add": {
                    "id": "add",
                    "onclick": "%%"
                }
            },

            // bootstrap: [
            //     "ccm.load", {
            //         "url": "https://stackpath.bootstrapcdn.com/bootstrap/4.1.2/css/bootstrap.min.css",
            //         "integrity": "sha384-Smlep5jCw/wG7hdkwQ/Z5nLIefveQRIY9nfy6xoR1uRYBtpZgI6339F5dgvm/e9B",
            //         "crossorigin": "anonymous"
            //     }
            // ],

            css: ["ccm.load", "https://ccmjs.github.io/akless-components/kanban_board/resources/default.css"],
            data: {},
            lanes: ["ToDo", "Doing"],
            // lanes: [],
            del: "Do you really want to delete this card?",
            members: [],

            //  "ignore": { "card": { "component": "https://ccmjs.github.io/akless-components/kanban_card/ccm.kanban_card.js", "config": {} } },
            "onchange": function (event) {
                // console.log(this.index, 'onchange', this.getValue(), event)
            },
            //  "logger": [ "ccm.instance", "https://ccmjs.github.io/akless-components/log/versions/ccm.log-4.0.1.js", [ "ccm.get", "https://ccmjs.github.io/akless-components/log/resources/configs.js", "greedy" ] ]

        },

        Instance: function () {

            let $, data;
            const self = this;

            this.ready = async () => {

                // set shortcut to help functions
                $ = self.ccm.helper;

                // listen to datastore changes => restart
                if ($.isObject(self.data) && $.isDatastore(self.data.store)) self.data.store.onchange = self.start;

                // logging of 'ready' event
                self.logger && self.logger.log('ready', $.privatize(self, true));

            };

            this.start = async () => {

                // console.log("Members (Board)", self.members);

                $.setContent(self.element, $.html(self.html.main));

                    // self.members.forEach((member) => {
                         createLanes();
                    // });

                async function createLanes(member) {
                    await self.user.login();

                    const card_store = await ccm.store({name: "kanban_team_cards", url: "http://192.168.99.101:8080"});

                    // get kanban board data
                    data = await $.dataset(self.data);
                    // data = await card_store.get({"owner": member});

                    // set initial lanes
                    if (!data.lanes) data.lanes = [];
                    for (let i = 0; i < self.lanes.length; i++) if (!data.lanes[i]) data.lanes[i] = {cards: []};

                    // logging of 'start' event
                    self.logger && self.logger.log('start', $.clone(data));

                    // render main HTML structure
                    // $.setContent(self.element, $.html(self.html.main));

                    // let current_user = $.html(self.html.user, {username: member});

                    const  current_user = self.element.querySelector('#kanban_board').appendChild($.html(self.html.user));

                    current_user.appendChild($.html(self.html.username, {username: member}));

                    const lanes_elem = current_user.appendChild($.html(self.html.lanes));

                    /**
                     * contains lanes
                     * @type {Element}
                     */
                    // const lanes_elem = self.element.querySelector('#lanes');

                    // create and append HTML structure for each lane
                    for (let i = 0; i < self.lanes.length; i++) {

                        /**
                         * data of lane
                         * @type {Object}
                         */
                        const lane_data = data.lanes[i];

                        /**
                         * lane HTML structure
                         * @type {Element}
                         */
                        const lane_elem = $.html(self.html.lane, self.lanes[i]);

                        /**
                         * contains cards and their drop zones
                         * @type {Element}
                         */
                        const cards_elem = lane_elem.querySelector('.cards');

                        // create and append HTML structure for each card
                        for (let j = 0; j < lane_data.cards.length; j++) {
                            const card_dependency = lane_data.cards[j];

                            // adjust instance configuration of card dependency
                            card_dependency[2] = $.clone(card_dependency[2] || {});
                            card_dependency[2].parent = self;

                            /**
                             * card instance
                             * @type {Object}
                             */
                            const card_inst = await $.solveDependency(card_dependency);

                                // render card in drop zone
                                await card_inst.start();

                            // append drop zone in cards element
                            cards_elem.appendChild(card_inst.root);

                            // add HTML class to the root element of the card instance
                            card_inst.root.classList.add('card');

                            // set drag'n'drop functionality for the root element
                            makeDraggable(self, card_inst.root);
                            makeDroppable(self, card_inst.root);

                            // set functionality for removing a card per double click
                            card_inst.root.addEventListener('dblclick', async () => {

                                // run confirm dialog
                                if (!confirm(self.del)) return;

                                /**
                                 * deleted card data
                                 * @type {Object}
                                 */
                                const card_data = data.lanes[i].cards[j];

                                // remove instance dependency of card from kanban board data
                                data.lanes[i].cards.splice(j, 1);

                                // update kanban board data in datastore
                                self.data.store && self.data.store.set(data);

                                /**
                                 * event data
                                 * @type {{lane: number, card: number, data: Object}}
                                 */
                                const event_data = {lane: i, card: j, data: card_data};

                                // logging of 'del' event
                                self.logger && self.logger.log('del', $.clone(event_data));

                                // perform individual 'change' callback
                                self.onchange && self.onchange.call(self, $.clone(event_data));

                                // restart
                                self.start();

                            });

                        }

                        // append button for creating a new card to first lane
                        if (self.ignore && i === 0) lane_elem.appendChild($.html(self.html.add, async () => {

                            /**
                             * instance configuration for new card
                             * @type {Object}
                             */
                            const config = $.clone(self.ignore.card.config);

                            // generate dataset key for new card
                            if (config.data.store) config.data.key = $.generateKey();

                            // create and add instance dependency for new card to kanban board data
                            data.lanes[i].cards.push(['ccm.instance', self.ignore.card.component, config]);

                            // update kanban board data in datastore and restart afterwards
                            self.data.store && await self.data.store.set(data);

                            // perform individual 'change' callback
                            self.onchange && self.onchange.call(self);

                            // logging of 'add' event
                            self.logger && self.logger.log('add');

                            // restart
                            self.start();

                        }));

                        // append prepared lane HTML structure to main HTML structure
                        lanes_elem.appendChild(lane_elem);

                    }

                }

                /**
                 * makes a card draggable
                 * @param {Object} self - kanban board instance
                 * @param {Object} card_elem - card element
                 */
                function makeDraggable(self, card_elem) {

                    // activate draggable functionality
                    card_elem.draggable = true;

                    // set draggable start event
                    card_elem.addEventListener('dragstart', event => {

                        /**
                         * card position
                         * @type {Array}
                         */
                        const pos = getPosition(event.target);

                        // remember original position of card
                        event.dataTransfer.setData('text', pos.join(','));

                        // add a drop zone under the last card of each lane as additional droppable area
                        [...lanes_elem.querySelectorAll('.cards')].forEach(cards_elem => {
                            const drop_zone = $.html({class: 'drop_zone'});
                            drop_zone.style.width = event.target.offsetWidth + 'px';
                            drop_zone.style.height = event.target.offsetHeight + 'px';
                            makeDroppable(self, drop_zone);
                            cards_elem.appendChild(drop_zone);
                        });

                        // logging of 'drag' event
                        self.logger && self.logger.log('drag', {
                            lane: pos[0],
                            card: pos[1],
                            data: $.clone(data.lanes[pos[0]].cards[pos[1]])
                        });

                    });

                    // set draggable end event => remove all drop zones
                    card_elem.addEventListener('dragend', () => [...lanes_elem.querySelectorAll('.drop_zone')].forEach($.removeElement));

                }

                /**
                 * makes an element droppable for cards
                 * @param {Object} self - kanban board instance
                 * @param {Element} elem - element
                 */
                function makeDroppable(self, elem) {

                    // allow droppable functionality
                    elem.addEventListener('dragover', event => event.preventDefault());

                    // set droppable event
                    elem.addEventListener('drop', async event => {

                        /**
                         * original position of dropped card
                         * @type {number[]}
                         */
                        const from = event.dataTransfer.getData('text').split(',').map(value => parseInt(value));

                        /**
                         * target card position
                         * @type {number[]}
                         */
                        const to = getPosition(event.target);

                        // is original position identical to target position? => abort
                        if (from[0] === to[0] && (from[1] === to[1] || from[1] === to[1] - 1)) return;

                        /**
                         * card data of dropped card
                         * @type {object}
                         */
                        const card_data = data.lanes[from[0]].cards[from[1]];

                        // mark original position as removed
                        data.lanes[from[0]].cards[from[1]] = null;

                        // add card at new position
                        data.lanes[to[0]].cards.splice(to[1], 0, card_data);

                        // has original position changed through shift? => correct original position
                        if (data.lanes[from[0]].cards[from[1]] !== null) from[1]++;

                        // delete original position completely
                        data.lanes[from[0]].cards.splice(from[1], 1);

                        /**
                         * event data
                         * @type {{from: number[], to: number[], data: Object}}
                         */
                        const event_data = {from: from, to: to, data: card_data};

                        // logging of 'drop' event
                        self.logger && self.logger.log('drop', $.clone(event_data));

                        // perform individual 'change' callback
                        self.onchange && self.onchange.call(self, $.clone(event_data));

                        // update changed kanban board data in datastore and restart afterwards
                        if (self.data.store) {
                            await self.data.store.set(data);
                            self.start();
                        }

                    });

                }

                /**
                 * gets position of a card
                 * @param {Element} card_elem - element of card
                 * @returns {number[]}
                 * @example [ 1, 3 ]
                 */
                function getPosition(card_elem) {

                    /**
                     * lane that contains the card
                     * @param {Element}
                     */
                    const lane_elem = $.findParentElementByClass(card_elem, 'lane');

                    // get and return lane coordinate x and card coordinate y
                    const x = [...lane_elem.parentNode.children].indexOf(lane_elem);
                    const y = [...card_elem.parentNode.children].indexOf(card_elem);

                    return [x, y];
                }

            };

            /**
             * returns current result data
             * @returns {Object} current kanban board data
             */
            self.getValue = () => data;

        }

    };

    let b = "ccm." + component.name + (component.version ? "-" + component.version.join(".") : "") + ".js";
    if (window.ccm && null === window.ccm.files[b]) return window.ccm.files[b] = component;
    (b = window.ccm && window.ccm.components[component.name]) && b.ccm && (component.ccm = b.ccm);
    "string" === typeof component.ccm && (component.ccm = {url: component.ccm});
    let c = (component.ccm.url.match(/(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)/) || ["latest"])[0];
    if (window.ccm && window.ccm[c]) window.ccm[c].component(component); else {
        var a = document.createElement("script");
        document.head.appendChild(a);
        component.ccm.integrity && a.setAttribute("integrity", component.ccm.integrity);
        component.ccm.crossorigin && a.setAttribute("crossorigin", component.ccm.crossorigin);
        a.onload = function () {
            window.ccm[c].component(component);
            document.head.removeChild(a)
        };
        a.src = component.ccm.url
    }
})();