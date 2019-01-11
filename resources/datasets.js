/**
 * @overview datasets of ccm component for kanban board
 * @author André Kless <andre.kless@web.de> 2017-2018
 * @license The MIT License (MIT)
 */

ccm.files[ 'datasets.js' ] = {

  "test": {
    "key": "local",
    "lanes": [
      {
        "cards": [
          [ "ccm.instance", "../kanban_team_card/ccm.kanban_team_card.js", [ "ccm.get", "../kanban_team_card/resources/configs.js", "local_white" ] ],
          [ "ccm.instance", "../kanban_team_card/ccm.kanban_team_card.js", [ "ccm.get", "../kanban_team_card/resources/configs.js", "local_gold" ] ]
        ],
      },
      {
        "cards": [
          [ "ccm.instance", "../kanban_team_card/ccm.kanban_team_card.js", [ "ccm.get", "../kanban_team_card/resources/configs.js", "local_blue" ] ]
        ]
      },
      { "cards": [] }
    ]
  },

  "experimental": {
    "key": "experimental",
    "lanes": [
      {
        "cards": [
          [ "ccm.instance", "../kanban_team_card/ccm.kanban_team_card.js", [ "ccm.get", "../kanban_team_card/resources/configs.js", "local_white" ] ],
        ]
      },
      {
        "cards": [
          [ "ccm.instance", "../quiz/ccm.quiz.js", [ "ccm.get", "../quiz/resources/configs.js", "local" ] ]
        ]
      },
      {
        "cards": [
          [ "ccm.instance", "../blank/ccm.blank.js" ],
          [ "ccm.instance", "../cloze/ccm.cloze.js", [ "ccm.get", "../cloze/resources/configs.js", "local" ] ]
        ]
      }
    ]
  }

};