/**
 * @overview ccm component for kanban team board
 * @author Julian Schäfer <Julian.Schaefer@smail.inf.h-brs.de> 2019
 * @license The MIT License (MIT)
 */

(function () {

    const component = {

        name: 'kanban_team_board',

        // ccm: 'https://ccmjs.github.io/ccm/ccm.js',
        ccm: 'https://ccmjs.github.io/ccm/versions/ccm-18.2.0.js',

        config: {

            kanban: ['ccm.component', 'http://kaul.inf.h-brs.de/data/ccm/kanban_board/versions/ccm.kanban_board-1.0.0.js'],
            user: ["ccm.instance", "https://ccmjs.github.io/akless-components/user/versions/ccm.user-8.3.1.js", ["ccm.get", "https://ccmjs.github.io/akless-components/user/resources/configs.js", "guest"]],

            // html: {
            //     "main": {
            //         "id": "kanban_board",
            //         "class": "container"
            //     },
            //     "lanes": {"id": "lanes"},
            //     "lane": {
            //         "class": "row lane",
            //         "inner": [
            //             {
            //                 "class": "title",
            //                 "inner": "%%"
            //             },
            //             {
            //                 "class": "cards",
            //                 // "inner": "%%"
            //             }
            //         ]
            //     },
            //     "row": {
            //         "class": "row"
            //     },
            //     "heading": {
            //         "class": "title col",
            //         "inner": "%%"
            //     },
            //     "user": {
            //         "class": "user col",
            //         "style": "min-height: 10em; max-width: 6em;",
            //         "inner": "%%"
            //     },
            //     "card": {
            //         "class": "card col",
            //         "style": "min-width: 18em;"
            //     },
            //     // "username": {
            //     //     "class": "username",
            //     //     "inner": "%%"
            //     // },
            //     "add": {
            //         "id": "add",
            //         "onclick": "%%"
            //     }
            // },

            html: {
                main: {
                    id: "kanban_board",
                    class: "container-fluid"
                },
                username: {
                    class: "username",
                    inner: "%%"
                },
                lane: {
                    class: "lane"
                },
                row: {
                    class: "row"
                },
                cards: {
                    class: "cards"
                }
            },

            // "html": {
            //     "main": {"id": "lanes"},
            //     "lane": {
            //         "class": "lane",
            //         "inner": [
            //             {
            //                 "class": "title",
            //                 "inner": "%%"
            //             },
            //             {"class": "cards"}
            //         ]
            //     },
            //     "add": {
            //         "id": "add",
            //         "onclick": "%%"
            //     }
            // },
            bootstrap: [
                "ccm.load", {
                    "url": "https://stackpath.bootstrapcdn.com/bootstrap/4.1.2/css/bootstrap.min.css",
                    "integrity": "sha384-Smlep5jCw/wG7hdkwQ/Z5nLIefveQRIY9nfy6xoR1uRYBtpZgI6339F5dgvm/e9B",
                    "crossorigin": "anonymous"
                }
            ],
            css: ["ccm.load", "https://ccmjs.github.io/akless-components/kanban_board/resources/default.css"],
            data: {},
            lanes: ["ToDo", "Doing", "Done"],
            del: "Do you really want to delete this card?",
            members: [],
            team_store: {},
            board_store: ['ccm.store', {
                "name": "kanban_team_borad",
                "url": "http://192.168.99.101:8080",
                "key": "sose_19"
            }],
            card_store: {},

            //  "ignore": { "card": { "component": "https://ccmjs.github.io/akless-components/kanban_card/ccm.kanban_card.js", "config": {} } },
            //  "onchange": function ( event ) { console.log( this.index, 'onchange', this.getValue(), event ) },
            //  "logger": [ "ccm.instance", "https://ccmjs.github.io/akless-components/log/versions/ccm.log-4.0.1.js", [ "ccm.get", "https://ccmjs.github.io/akless-components/log/resources/configs.js", "greedy" ] ]

        },

        Instance: function () {

            let $, data;

            /**
             * own reference for inner functions
             * @type {Instance}
             */
            const self = this;

            this.ready = async () => {

                // set shortcut to help functions
                $ = this.ccm.helper;

                // listen to datastore changes => restart
                if ($.isObject(this.data) && $.isDatastore(this.data.store)) this.data.store.onchange = this.start;

                // logging of 'ready' event
                this.logger && this.logger.log('ready', $.privatize(this, true));

            };

            this.start = async () => {

                data = await $.dataset(this.data);
                console.log("data", data);

                // set initial lanes
                if (!data.lanes) data.lanes = [];
                for (let i = 0; i < this.lanes.length; i++) if (!data.lanes[i]) data.lanes[i] = {
                    title: this.lanes[i],
                    cards: []
                };

                // logging of 'start' event
                this.logger && this.logger.log('start', $.clone(data));

                // create html main structure
                $.setContent(self.element, $.html(self.html.main));
                const main = self.element.querySelector('#kanban_board');

                // iterate through members to generate one line per member
                for (let members_index = 0; members_index < self.members.length; members_index++) {
                    let member = self.members[members_index];

                    let row = main.appendChild($.html(self.html.row));

                    row.appendChild($.html(self.html.username, member));

                    // iterate through lanes to generate all lanes per member
                    for (let lanes_index = 0; lanes_index < data.lanes.length; lanes_index++) {

                        // current lane
                        let lane = data.lanes[lanes_index];
                        let col = row.appendChild($.html(self.html.lane));
                        let col_cards = col.appendChild($.html(self.html.cards));

                        for (let cards_index = 0; cards_index < lane.cards.length; cards_index++) {

                            // Get card data from card store by using cards key
                            let card_data = await self.card_store.store.get(lane.cards[cards_index][2].data.key);

                            // Only add cards when card owner is current team member
                            if (card_data.owner === member) {

                                const card_dependency = lane.cards[cards_index];

                                // adjust instance configuration of card dependency
                                card_dependency[2] = $.clone(card_dependency[2] || {});
                                // card_dependency[2].parent = this;
                                card_dependency[2].parent = col;

                                console.log("card_dependency", card_dependency);

                                /**
                                 * card instance
                                 * @type {Object}
                                 */
                                const card_inst = await $.solveDependency(card_dependency);

                                // render card in drop zone
                                await card_inst.start();

                                // append drop zone in cards element
                                col_cards.appendChild(card_inst.root);

                                // add HTML class to the root element of the card instance
                                card_inst.root.classList.add('card');

                                // set drag'n'drop functionality for the root element
                                makeDraggable(self, card_inst.root);
                                makeDroppable(self, card_inst.root);

                                // const card_inst = await $.solveDependency(lane.cards[cards_index]);
                                //
                                // // render card in drop zone
                                // await card_inst.start();
                                //
                                // col.appendChild(card_inst.root);
                                //
                                // // set drag'n'drop functionality for the root element
                                // makeDraggable(this, card_inst.root);
                                // makeDroppable(this, card_inst.root);
                            }
                        }
                    }

                }

                    // // append button for creating a new card to first lane
                    // if (this.ignore && i === 0) main.appendChild($.html(this.html.add, async () => {
                    //
                    //     /**
                    //      * instance configuration for new card
                    //      * @type {Object}
                    //      */
                    //     const config = $.clone(this.ignore.card.config);
                    //
                    //     // generate dataset key for new card
                    //     if ($.isObject(config.data) && config.data.store) config.data.key = $.generateKey();
                    //
                    //     // create and add instance dependency for new card to kanban board data
                    //     data.lanes[i].cards.push(['ccm.instance', this.ignore.card.component, config]);
                    //
                    //     // update kanban board data in datastore and restart afterwards
                    //     this.data.store && await this.data.store.set(data);
                    //
                    //     // perform individual 'change' callback
                    //     this.onchange && this.onchange.call(this);
                    //
                    //     // logging of 'add' event
                    //     this.logger && this.logger.log('add');
                    //
                    //     // restart
                    //     this.start();
                    //
                    // }));

                // create html main structure
                // $.setContent(self.element, $.html(self.html.main));
                //
                // const main = self.element.querySelector('#kanban_board');
                //
                // const heading_row = main.appendChild($.html(self.html.row));
                //
                // heading_row.appendChild($.html(self.html.heading, "User"));
                // self.lanes.forEach((lane, index, lanes) => {
                //     heading_row.appendChild($.html(self.html.heading, lane));
                // });
                //
                // // self.members.forEach((member, index, members) => {
                // for (let i = 0; i < self.members.length; i++) {
                //     let member = self.members[i];
                //
                //     let row = main.appendChild($.html(self.html.row));
                //     row.appendChild($.html(self.html.user, member));
                //
                //     for (let j = 0; j < data.lanes.length; j++) {
                //         // let cards = [];
                //
                //         let lane = data.lanes[j];
                //         let col = row.appendChild($.html(self.html.card));
                //
                //         if (lane.hasOwnProperty('cards')) {
                //             for (let k = 0; k < lane.cards.length; k++) {
                //
                //                 /**
                //                  * Get card data from card store by using cards key
                //                  */
                //                 let card_data = await self.card_store.store.get( lane.cards[k][2].data.key );
                //
                //                 // Only add cards when card owner is current team member
                //                 if ( card_data.owner === member ) {
                //                     const card_inst = await $.solveDependency( lane.cards[k] );
                //
                //                     // render card in drop zone
                //                     await card_inst.start();
                //
                //                     col.appendChild(card_inst.root);
                //
                //                     // set drag'n'drop functionality for the root element
                //                     makeDraggable( this, card_inst.root );
                //                     makeDroppable( this, card_inst.root );
                //                 }
                //
                //                 // cards.push(await card_store.get(card_key));
                //                 // console.log(card);
                //
                //                 // user_cards[card.owner] = card;
                //             }
                //             // console.log("cards", cards);
                //             // console.log(filterCardsForUser(member, cards));
                //         } else {
                //             // row.appendChild($.html(self.html.card));
                //         }
                //
                //         // let lane_user_cards = filterCardsForUser(member, cards);
                //         // console.log(lane_user_cards);
                //
                //         // console.log("cards", cards);
                //     }
                //
                //     // });
                // }

                // // render main HTML structure
                // $.setContent(this.element, $.html(this.html.main));
                //
                // /**
                //  * contains lanes
                //  * @type {Element}
                //  */
                // const lanes_elem = this.element.querySelector('#lanes');
                //
                // // create and append HTML structure for each lane
                // for (let i = 0; i < this.lanes.length; i++) {
                //
                //     /**
                //      * data of lane
                //      * @type {Object}
                //      */
                //     const lane_data = data.lanes[i];
                //
                //     /**
                //      * lane HTML structure
                //      * @type {Element}
                //      */
                //     const lane_elem = $.html(this.html.lane, this.lanes[i]);
                //
                //     /**
                //      * contains cards and their drop zones
                //      * @type {Element}
                //      */
                //     const cards_elem = lane_elem.querySelector('.cards');
                //
                //     // create and append HTML structure for each card
                //     for (let j = 0; j < lane_data.cards.length; j++) {
                //         const card_dependency = lane_data.cards[j];
                //
                //         // adjust instance configuration of card dependency
                //         card_dependency[2] = $.clone(card_dependency[2] || {});
                //         card_dependency[2].parent = this;
                //
                //         /**
                //          * card instance
                //          * @type {Object}
                //          */
                //         const card_inst = await $.solveDependency(card_dependency);
                //
                //         // render card in drop zone
                //         await card_inst.start();
                //
                //         // append drop zone in cards element
                //         cards_elem.appendChild(card_inst.root);
                //
                //         // add HTML class to the root element of the card instance
                //         card_inst.root.classList.add('card');
                //
                //         // set drag'n'drop functionality for the root element
                //         makeDraggable(this, card_inst.root);
                //         makeDroppable(this, card_inst.root);
                //
                //         // set functionality for removing a card per double click
                //         card_inst.root.addEventListener('dblclick', async () => {
                //
                //             // run confirm dialog
                //             if (!confirm(this.del)) return;
                //
                //             /**
                //              * deleted card data
                //              * @type {Object}
                //              */
                //             const card_data = data.lanes[i].cards[j];
                //
                //             // remove instance dependency of card from kanban board data
                //             data.lanes[i].cards.splice(j, 1);
                //
                //             // update kanban board data in datastore
                //             this.data.store && await this.data.store.set(data);
                //
                //             /**
                //              * event data
                //              * @type {{lane: number, card: number, data: Object}}
                //              */
                //             const event_data = {lane: i, card: j, data: card_data};
                //
                //             // logging of 'del' event
                //             this.logger && this.logger.log('del', $.clone(event_data));
                //
                //             // perform individual 'change' callback
                //             this.onchange && this.onchange.call(this, $.clone(event_data));
                //
                //             // restart
                //             this.start();
                //
                //         });
                //
                //     }
                //
                //     // append button for creating a new card to first lane
                //     if (this.ignore && i === 0) lane_elem.appendChild($.html(this.html.add, async () => {
                //
                //         /**
                //          * instance configuration for new card
                //          * @type {Object}
                //          */
                //         const config = $.clone(this.ignore.card.config);
                //
                //         // generate dataset key for new card
                //         if ($.isObject(config.data) && config.data.store) config.data.key = $.generateKey();
                //
                //         // create and add instance dependency for new card to kanban board data
                //         data.lanes[i].cards.push(['ccm.instance', this.ignore.card.component, config]);
                //
                //         // update kanban board data in datastore and restart afterwards
                //         this.data.store && await this.data.store.set(data);
                //
                //         // perform individual 'change' callback
                //         this.onchange && this.onchange.call(this);
                //
                //         // logging of 'add' event
                //         this.logger && this.logger.log('add');
                //
                //         // restart
                //         this.start();
                //
                //     }));
                //
                //     // append prepared lane HTML structure to main HTML structure
                //     lanes_elem.appendChild(lane_elem);
                //
                // }

                /**
                 * makes a card draggable
                 * @param {Object} self - kanban board instance
                 * @param {Object} card_elem - card element
                 */
                function makeDraggable(self, card_elem) {

                    const lanes_elem = $.findParentElementByClass(card_elem, 'lane');
                    console.log("lanes_elem", lanes_elem);

                    // activate draggable functionality
                    card_elem.draggable = true;

                    // set draggable start event
                    card_elem.addEventListener('dragstart', event => {

                        /**
                         * card position
                         * @type {Array}
                         */
                        const pos = getPosition(event.target);
                        console.log("pos", pos);

                        // remember original position of card
                        event.dataTransfer.setData('text', pos.join(','));
                        console.log("dataTrasfer", event.dataTransfer);

                        let test = lanes_elem.querySelectorAll('.cards');
                        console.log("test", test);

                        // add a drop zone under the last card of each lane as additional droppable area
                        [...lanes_elem.querySelectorAll('.cards')].forEach(cards_elem => {
                            console.log("cards_elem", cards_elem);
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

                    console.log("MAKE DROPPABLE");

                    // const lane_elem = $.findParentElementByClass(elem, 'lane');

                    // allow droppable functionality
                    elem.addEventListener('dragover', event => event.preventDefault());

                    // set droppable event
                    elem.addEventListener('drop', async event => {

                        console.log("--- DROP ---");

                        /**
                         * original position of dropped card
                         * @type {number[]}
                         */
                        const from = event.dataTransfer.getData('text').split(',').map(value => parseInt(value));
                        console.log("from", from);

                        /**
                         * target card position
                         * @type {number[]}
                         */
                        const to = getPosition(event.target);
                        console.log("to", to);

                        // is original position identical to target position? => abort
                        if (from[0] === to[0] && (from[1] === to[1] || from[1] === to[1] - 1)) return;

                        /**
                         * card data of dropped card
                         * @type {object}
                         */
                        const card_data = data.lanes[from[0]].cards[from[1]];
                        console.log("card_data", card_data);

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
                            console.log("Store - TRUE");
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
                        // console.log("card_elem", card_elem);
                        // console.log("ElementByClass", $.findParentElementByClass(card_elem, 'lane'));
                    const lane_elem = $.findParentElementByClass(card_elem, 'lane');

                    // console.log("lane_elem", lane_elem);

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
            this.getValue = () => data;

            async function getTeamID(user) {

                // Get Teamstore data
                const team_data = (await self.team_store.store.get({"_id": self.team_store.key}))[0];

                // Reduce to team key of user
                return team_data.teams.reduce((result, team) => {
                    if (team.members.hasOwnProperty(user)) {
                        result = team.key;
                    }

                    return result
                });
            }

            /**
             * Gets team of given user
             * @param user
             * @returns {Promise<Array|T[]>}
             */
            async function getTeamMembers(user) {

                // Get team data
                let teams = (await self.team_store.store.get({"_id": self.team_store.key}))[0].teams;

                // filter team of user
                return teams.filter((team, index, teams) => {
                    if (team.members.hasOwnProperty(user)) {
                        return team;
                    }
                });

            }

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