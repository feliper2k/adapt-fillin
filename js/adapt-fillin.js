/*
* adapt-contrib-question
* License - http://github.com/adaptlearning/adapt_framework/LICENSE
* Maintainers - Daryl Hedley <darylhedley@gmail.com>
*/
define(function(require) {

    var QuestionView = require('coreViews/questionView');
    var Adapt = require('coreJS/adapt');

    var FillIn = QuestionView.extend({

        events: {
            "click .fillin-inner .button.submit": "onSubmitClicked",
            "click .fillin-inner .button.reset": "onResetClicked",
            "click .fillin-inner .button.model": "onModelAnswerClicked",
            "click .fillin-inner .button.user": "onUserAnswerClicked"
        },

        initialize: function() {
            QuestionView.prototype.initialize.apply(this, arguments);

            this.setupQuestion();
            this.render();
        },

        // Used by question to disable the question during submit and complete stages
        disableQuestion: function() {},

        // Used by question to enable the question during interactions
        enableQuestion: function() {},

        // Used by the question to reset the question when revisiting the component
        resetQuestionOnRevisit: function() {},

        // Left blank for question setup - should be used instead of preRender
        setupQuestion: function() {
            var $questionText = this.model.get('_text');

            var $pattern = /\*(.+?)\*/gi;
            var $items = _.map($questionText.match($pattern), function(match) {
                return {
                    _modelAnswer: match.replace($pattern, '$1')       // strips asterisks
                };
            });
            var newHtml = $questionText.replace($pattern, '<span class="ph">$1</span>');

            this.model.set('_textHTML', newHtml);
            this.model.set('_items', $items);

            QuestionView.prototype.preRender.apply(this, arguments);
        },

        render: function() {
            QuestionView.prototype.render.apply(this, arguments);

            _.defer(this.onQuestionRendered.bind(this));
        },

        // Blank method used just like postRender is for presentational components
        onQuestionRendered: function() {
            // zamieniaj oznaczone wyrazy na pola tekstowe
            this.$('.fillin-text span.ph').each(function(ph, elem) {
                var $elem = $(elem);

                var $elemWidth = $elem.width();
                $elem.html(
                    '<input type="text" value="" style="width: '+$elemWidth+'px">' +
                    '<span class="icon"></span>'
                );
            });

            this.setReadyStatus();
        },

        // Use to check if the user is allowed to submit the question
        // Maybe the user has to select an item?
        // Should return a boolean
        canSubmit: function() {
            return _(this.$('.fillin-text input')).every(function(input) {
                return !!input.value;
            });
        },

        // Blank method for question to fill out when the question cannot be submitted
        onCannotSubmit: function() {},

        // This is important for returning or showing the users answer
        // This should preserve the state of the users answers
        storeUserAnswer: function() {
            _.each(this.model.get('_items'), function(item, index) {
                item._userAnswer = this.$('.fillin-text input').eq(index).val();
                item.correct = this.ciEquals(item._userAnswer, item._modelAnswer);
            }, this);
        },

        ciEquals: function(text1, text2) {
            return (new RegExp('^'+text2+'$', "i")).test(text1);
        },

        // Should return a boolean based upon whether to question is correct or not
        isCorrect: function() {
            return _.every(this.model.get('_items'), function(item) {
                return this.ciEquals(item._userAnswer, item._modelAnswer);
            }, this);
        },

        // Used to set the score based upon the _questionWeight
        setScore: function() {

        },

        // This is important and should give the user feedback on how they answered the question
        // Normally done through ticks and crosses by adding classes
        markQuestion: function() {
            this.$('span.ph').each(function(index, item) {
                var answers = this.model.get('_items');
                $(item).find('input').attr('class', answers[index].correct ? 'correct' : 'incorrect')
                $(item).find('span.icon').addClass(answers[index].correct ? 'icon-tick' : 'icon-cross');
            }.bind(this));
            QuestionView.prototype.markQuestion.apply(this);
        },

        // Used by the question to determine if the question is incorrect or partly correct
        // Should return a boolean
        isPartlyCorrect: function() {
            return _.some(this.model.get('_items'), function(item) {
                return this.ciEquals(item._userAnswer, item._modelAnswer);
            }, this);
        },

        // Used by the question view to reset the stored user answer
        resetUserAnswer: function() {},

        // Used by the question view to reset the look and feel of the component.
        // This could also include resetting item data
        resetQuestion: function() {
            _.each(this.model.get('_items'), function(item) {
                delete item._userAnswer;
            }, this);

            this.$('span.ph input').val('');
            this.$('span.ph input').attr('class','');
            this.$('span.ph .icon').attr('class', 'icon');

            QuestionView.prototype.resetQuestion.apply(this, arguments);
        },

        // Used by the question to display the correct answer to the user
        onModelAnswerShown: function() {
            _.each(this.model.get('_items'), function(item, index) {
                this.$('.fillin-text input').eq(index).val(item._modelAnswer);
            }, this);
        },

        // Used by the question to display the users answer and
        // hide the correct answer
        // Should use the values stored in storeUserAnswer
        onUserAnswerShown: function() {
            _.each(this.model.get('_items'), function(item, index) {
                this.$('.fillin-text input').eq(index).val(item._userAnswer);
            }, this);
        },

        onSubmitClicked: function() {
            QuestionView.prototype.onSubmitClicked.apply(this, arguments);

//            if (this.canSubmit()) {
//                this.setAllItemsEnabled(false);
//                this.setResetButtonEnabled(!this.model.get('_isComplete'));
//            }
        }
    });

    Adapt.register("fillin", FillIn);

    return FillIn;

});
