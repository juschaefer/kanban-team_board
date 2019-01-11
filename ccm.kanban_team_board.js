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

( function () {

  const component = {

    name: 'kanban_team_board',

    //ccm: 'https://ccmjs.github.io/ccm/ccm.js',
    ccm: 'https://ccmjs.github.io/ccm/versions/ccm-18.2.0.js',

    "jquery": [
      "ccm.load", {
        "url": "https://code.jquery.com/jquery-3.3.1.slim.min.js",
        "integrity": "sha384-q8i/X+965DzO0rT7abK41JStQIAqVgRVzpbzo5smXKp4YfRvH+8abtTE1Pi6jizo",
        "crossorigin": "anonymous"
      }
    ],

    "propper": [
      "ccm.load", {
        "url": "https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.3/umd/popper.min.js",
        "integrity": "sha384-ZMP7rVo3mIykV+2+9J3UJ46jBk0WLaUAdn689aCwoqbBJiSnjAK/l8WvCWPIPm49",
        "crossorigin": "anonymous"
      }
    ],


    "bootstrap": [
      "ccm.load", {
        "url": "https://stackpath.bootstrapcdn.com/bootstrap/4.1.2/js/bootstrap.min.js",
        "integrity": "sha384-o+RDsa0aLu++PJvFqy8fFScvbHFLtbvScb8AjopnFD+iEQ7wo/CG0xlczd+2O/em",
        "crossorigin": "anonymous"
      }, {
        "url": "https://stackpath.bootstrapcdn.com/bootstrap/4.1.2/css/bootstrap.min.css",
        "integrity": "sha384-Smlep5jCw/wG7hdkwQ/Z5nLIefveQRIY9nfy6xoR1uRYBtpZgI6339F5dgvm/e9B",
        "crossorigin": "anonymous"
      }
    ],

    config: {

      "html": {
        "main": { "id": "lanes" },
        "lane": {
          "class": "lane",
          "inner": [
            {
              "class": "title",
              "inner": "%%"
            },
            { "class": "cards" }
          ]
        },
        "add": {
          "id": "add",
          "onclick": "%%"
        }
      },
      "css": [ "ccm.load", "https://ccmjs.github.io/akless-components/kanban_board/resources/default.css" ],
      "data": {},
      "lanes": [ "ToDo", "Doing", "Done" ],
      "del": "Do you really want to delete this card?"

  //  "ignore": { "card": { "component": "https://ccmjs.github.io/akless-components/kanban_card/ccm.kanban_card.js", "config": {} } },
  //  "onchange": function ( event ) { console.log( this.index, 'onchange', this.getValue(), event ) },
  //  "logger": [ "ccm.instance", "https://ccmjs.github.io/akless-components/log/versions/ccm.log-4.0.1.js", [ "ccm.get", "https://ccmjs.github.io/akless-components/log/resources/configs.js", "greedy" ] ]

    },

    Instance: function () {

      let $, data;

      this.ready = async () => {

        // set shortcut to help functions
        $ = this.ccm.helper;

        // listen to datastore changes => restart
        if ( $.isObject( this.data ) && $.isDatastore( this.data.store ) ) this.data.store.onchange = this.start;

        // logging of 'ready' event
        this.logger && this.logger.log( 'ready', $.privatize( this, true ) );

      };

      this.start = async () => {

        // get kanban board data
        data = await $.dataset( this.data );

        // set initial lanes
        if ( !data.lanes ) data.lanes = []; for ( let i = 0; i < this.lanes.length; i++ ) if ( !data.lanes[ i ] ) data.lanes[ i ] = { cards: [] };

        // logging of 'start' event
        this.logger && this.logger.log( 'start', $.clone( data ) );

        // render main HTML structure
        $.setContent( this.element, $.html( this.html.main ) );

        // let my_uid = self.user.data().id.toLowerCase().trim();
        let my_uid;
        let my_team;

        console.log(data);
        data.map(group => {
          group.teams.map((team, index) => {
            Object.keys(team.members).map(uid => {
              let _uid = uid.toLowerCase().trim();
              if (my_uid === _uid) {
                my_team = team;
                team_name.innerText = team.name || `Gruppe ${group.key.slice(-1)} Team ${index + 1}` || team.key;
              }
            });
          });
        });

        // console.log("#", self.ccm.helper.dataset());
        // console.log("my_uid", my_uid);
        // console.log("my_team", my_team);
        // self.ccm.helper.dataset( self.teamstore, ( groups ) => {
        //   console.log("Group");
        //   groups.map(group => {
        //     group.teams.map((team, index) => {
        //       Object.keys(team.members).map(uid => {
        //         let _uid = uid.toLowerCase().trim();
        //         if (my_uid === _uid) {
        //           my_team = team;
        //           team_name.innerText = team.name || `Gruppe ${group.key.slice(-1)} Team ${index + 1}` || team.key;
        //         }
        //       });
        //     });
        //   });
        //   console.log("Groups: ", groups);
        //   console.log("my_team: ", my_team);
        //   console.log("my_uid: ", my_uid);
        // });



        /**
         * contains lanes
         * @type {Element}
         */
        const lanes_elem = this.element.querySelector( '#lanes' );

        // create and append HTML structure for each lane
        for ( let i = 0; i < this.lanes.length; i++ ) {

          /**
           * data of lane
           * @type {Object}
           */
          const lane_data = data.lanes[ i ];
//            console.log("lane_data", lane_data);
          /**
           * lane HTML structure
           * @type {Element}
           */
          const lane_elem = $.html( this.html.lane, this.lanes[ i ] );

          /**
           * contains cards and their drop zones
           * @type {Element}
           */
          const cards_elem = lane_elem.querySelector( '.cards' );

          // create and append HTML structure for each card
          for ( let j = 0; j < lane_data.cards.length; j++ ) {
            const card_dependency = lane_data.cards[ j ];
// console.log("card_dependency", card_dependency);
            // adjust instance configuration of card dependency
            card_dependency[ 2 ] = $.clone( card_dependency[ 2 ] || {} );
            card_dependency[ 2 ].parent = this;

            /**
             * card instance
             * @type {Object}
             */
            const card_inst = await $.solveDependency( card_dependency );

            // console.log("card_inst", card_inst);

            // render card in drop zone
            await card_inst.start();

            // append drop zone in cards element
            cards_elem.appendChild( card_inst.root );

            // add HTML class to the root element of the card instance
            card_inst.root.classList.add( 'card' );

            // set drag'n'drop functionality for the root element
            makeDraggable( this, card_inst.root );
            makeDroppable( this, card_inst.root );

            // set functionality for removing a card per double click
            card_inst.root.addEventListener( 'dblclick', async () => {

              // run confirm dialog
              if ( !confirm( this.del ) ) return;

              /**
               * deleted card data
               * @type {Object}
               */
              const card_data = data.lanes[ i ].cards[ j ];

              // remove instance dependency of card from kanban board data
              data.lanes[ i ].cards.splice( j, 1 );

              // update kanban board data in datastore
              this.data.store && this.data.store.set( data );

              /**
               * event data
               * @type {{lane: number, card: number, data: Object}}
               */
              const event_data = { lane: i, card: j, data: card_data };

              // logging of 'del' event
              this.logger && this.logger.log( 'del', $.clone( event_data ) );

              // perform individual 'change' callback
              this.onchange && this.onchange.call( this, $.clone( event_data ) );

              // restart
              this.start();

            } );

          }

          // append button for creating a new card to first lane
          if ( this.ignore && i === 0 ) lane_elem.appendChild( $.html( this.html.add, async () => {

            /**
             * instance configuration for new card
             * @type {Object}
             */
            const config = $.clone( this.ignore.card.config );

            // generate dataset key for new card
            if ( config.data.store ) config.data.key = $.generateKey();

            // create and add instance dependency for new card to kanban board data
            data.lanes[ i ].cards.push( [ 'ccm.instance', this.ignore.card.component, config ] );

            // update kanban board data in datastore and restart afterwards
            this.data.store && await this.data.store.set( data );

            // perform individual 'change' callback
            this.onchange && this.onchange.call( this );

            // logging of 'add' event
            this.logger && this.logger.log( 'add' );

            // restart
            this.start();

          } ) );

          // append prepared lane HTML structure to main HTML structure
          lanes_elem.appendChild( lane_elem );

        }

        /**
         * makes a card draggable
         * @param {Object} self - kanban board instance
         * @param {Object} card_elem - card element
         */
        function makeDraggable( self, card_elem ) {

          // activate draggable functionality
          card_elem.draggable = true;

          // set draggable start event
          card_elem.addEventListener( 'dragstart', event => {

            /**
             * card position
             * @type {Array}
             */
            const pos = getPosition( event.target );

            // remember original position of card
            event.dataTransfer.setData( 'text', pos.join( ',' ) );

            // add a drop zone under the last card of each lane as additional droppable area
            [ ...lanes_elem.querySelectorAll( '.cards' ) ].forEach( cards_elem => {
              const drop_zone = $.html( { class: 'drop_zone' } );
              drop_zone.style.width  = event.target.offsetWidth  + 'px';
              drop_zone.style.height = event.target.offsetHeight + 'px';
              makeDroppable( self, drop_zone );
              cards_elem.appendChild( drop_zone );
            } );

            // logging of 'drag' event
            self.logger && self.logger.log( 'drag', { lane: pos[ 0 ], card: pos[ 1 ], data: $.clone( data.lanes[ pos[ 0 ] ].cards[ pos[ 1 ] ] ) } );

          } );

          // set draggable end event => remove all drop zones
          card_elem.addEventListener( 'dragend', () => [ ...lanes_elem.querySelectorAll( '.drop_zone' ) ].forEach( $.removeElement ) );

        }

        /**
         * makes an element droppable for cards
         * @param {Object} self - kanban board instance
         * @param {Element} elem - element
         */
        function makeDroppable( self, elem ) {

          // allow droppable functionality
          elem.addEventListener( 'dragover', event => event.preventDefault() );

          // set droppable event
          elem.addEventListener( 'drop', async event => {

            /**
             * original position of dropped card
             * @type {number[]}
             */
            const from = event.dataTransfer.getData( 'text' ).split( ',' ).map( value => parseInt( value ) );

            /**
             * target card position
             * @type {number[]}
             */
            const to = getPosition( event.target );

            // is original position identical to target position? => abort
            if ( from[ 0 ] === to[ 0 ] && ( from[ 1 ] === to[ 1 ] || from[ 1 ] === to[ 1 ] - 1 ) ) return;

            /**
             * card data of dropped card
             * @type {object}
             */
            const card_data = data.lanes[ from[ 0 ] ].cards[ from[ 1 ] ];

            // mark original position as removed
            data.lanes[ from[ 0 ] ].cards[ from[ 1 ] ] = null;

            // add card at new position
            data.lanes[ to[ 0 ] ].cards.splice( to[ 1 ], 0, card_data );

            // has original position changed through shift? => correct original position
            if ( data.lanes[ from[ 0 ] ].cards[ from[ 1 ] ] !== null ) from[ 1 ]++;

            // delete original position completely
            data.lanes[ from[ 0 ] ].cards.splice( from[ 1 ], 1 );

            /**
             * event data
             * @type {{from: number[], to: number[], data: Object}}
             */
            const event_data = { from: from, to: to, data: card_data };

            // logging of 'drop' event
            self.logger && self.logger.log( 'drop', $.clone( event_data ) );

            // perform individual 'change' callback
            self.onchange && self.onchange.call( self, $.clone( event_data ) );

            // update changed kanban board data in datastore and restart afterwards
            if ( self.data.store ) { await self.data.store.set( data ); self.start(); }

          } );

        }

        /**
         * gets position of a card
         * @param {Element} card_elem - element of card
         * @returns {number[]}
         * @example [ 1, 3 ]
         */
        function getPosition( card_elem ) {

          /**
           * lane that contains the card
           * @param {Element}
           */
          const lane_elem = $.findParentElementByClass( card_elem, 'lane' );

          // get and return lane coordinate x and card coordinate y
          const x = [ ...lane_elem.parentNode.children ].indexOf( lane_elem );
          const y = [ ...card_elem.parentNode.children ].indexOf( card_elem );

          return [ x, y ];
        }

      };

      /**
       * returns current result data
       * @returns {Object} current kanban board data
       */
      this.getValue = () => data;

    }

  };

  let b="ccm."+component.name+(component.version?"-"+component.version.join("."):"")+".js";if(window.ccm&&null===window.ccm.files[b])return window.ccm.files[b]=component;(b=window.ccm&&window.ccm.components[component.name])&&b.ccm&&(component.ccm=b.ccm);"string"===typeof component.ccm&&(component.ccm={url:component.ccm});let c=(component.ccm.url.match(/(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)/)||["latest"])[0];if(window.ccm&&window.ccm[c])window.ccm[c].component(component);else{var a=document.createElement("script");document.head.appendChild(a);component.ccm.integrity&&a.setAttribute("integrity",component.ccm.integrity);component.ccm.crossorigin&&a.setAttribute("crossorigin",component.ccm.crossorigin);a.onload=function(){window.ccm[c].component(component);document.head.removeChild(a)};a.src=component.ccm.url}
} )();