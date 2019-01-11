/**
 * @overview configurations of ccm component for kanban board
 * @author André Kless <andre.kless@web.de> 2017-2018
 * @license The MIT License (MIT)
 */

ccm.files[ 'configs.js' ] = {

  "local": {
    "key": "local",
    "css.1": "../kanban_team_board/resources/default.css",
    "data": {
      "store": [ "ccm.store", "../kanban_team_board/resources/datasets.js" ],
      "key": "test"
    },
    "logger": [ "ccm.instance", "../../akless-components/log/ccm.log.js", [ "ccm.get", "../../akless-components/log/resources/configs.js", "greedy" ] ],
    "onchange": function ( event ) { console.log( this.index, 'onchange', this.getValue(), event ) },
    "ignore": {
      "card": {
        "component": "../kanban_team_card/ccm.kanban_team_card.js",
        "config": {
          "css.1": "../kanban_team_card/resources/default.css",
          "data": {
            "store": [ "ccm.store" ]
          },
          "icon": {
            "owner": "../kanban_team_card/resources/owner.svg",
            "deadline": "../kanban_team_card/resources/deadline.svg"
          }
        }
      }
    }
  },

  "localhost": {
    "key": "localhost",
    "css.1": "../kanban_team_board/resources/default.css",
    "data": {
      "store": [ "ccm.store", { "name": "kanban_team_board", "url": "http://localhost:8080" } ],
      "key": "demo"
    },
    "onchange": function ( event ) { console.log( this.index, 'onchange', this.getValue(), event ) },
    "ignore": {
      "card": {
        "component": "../kanban_team_card/ccm.kanban_team_card.js",
        "config": {
          "css.1": "../kanban_team_card/resources/default.css",
          "data": {
            "store": [ "ccm.store" ]
          },
          "icon": {
            "owner": "../kanban_team_card/resources/owner.svg",
            "deadline": "../kanban_team_card/resources/deadline.svg"
          }
        }
      }
    }
  },

  "demo": {
    "key": "demo",
    "data": {
      "store": [ "ccm.store", { "name": "kanban_board", "url": "https://ccm2.inf.h-brs.de" } ],
      "key": "demo"
    },
    "ignore": {
      "card": {
        "component": "https://ccmjs.github.io/akless-components/kanban_card/ccm.kanban_team_card.js",
        "config": {
          "data": {
            "store": [ "ccm.store", { "name": "kanban_card", "url": "https://ccm2.inf.h-brs.de" } ]
          },
          "css.1": "https://ccmjs.github.io/akless-components/kanban_card/resources/default.css"
        }
      }
    }
  },

  "offline": {
    "key": "offline",
    "data": {
      "store": [ "ccm.store", { "name": "kanban_board" } ],
      "key": "demo"
    },
    "ignore": {
      "card": {
        "component": "https://ccmjs.github.io/akless-components/kanban_card/ccm.kanban_team_card.js",
        "config": {
          "data": {
            "store": [ "ccm.store", { "name": "kanban_card" } ]
          },
          "css.1": "https://ccmjs.github.io/akless-components/kanban_card/resources/gold.css"
        }
      }
    }
  },

  "realtime": {
    "key": "realtime",
    "data": {
      "store": [ "ccm.store", { "name": "kanban_board", "url": "wss://ccm2.inf.h-brs.de" } ],
      "key": "realtime"
    },
    "ignore": {
      "card": {
        "component": "https://ccmjs.github.io/akless-components/kanban_card/ccm.kanban_team_card.js",
        "config": {
          "data": {
            "store": [ "ccm.store", { "name": "kanban_card", "url": "wss://ccm2.inf.h-brs.de" } ]
          },
          "css.1": "https://ccmjs.github.io/akless-components/kanban_card/resources/blue.css"
        }
      }
    }
  },

  "experimental": {
    "key": "experimental",
    "data": {
      "store": [ "ccm.store", "../kanban_team_board/resources/datasets.js" ],
      "key": "experimental"
    }
  }

};