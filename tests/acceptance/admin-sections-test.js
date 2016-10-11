import Ember from 'ember';
import { module, test } from 'qunit';
import startApp from 'ember-addon-review/tests/helpers/start-app';

module('Acceptance | admin sections', {
  beforeEach: function() {
    this.application = startApp();
  },

  afterEach: function() {
    Ember.run(this.application, 'destroy');
  }
});

test('"Addons needing categorization" section does not include WIP addons', function(assert) {
  server.createList('addon', 10);
  server.create('addon', { is_wip: true });

  login();
  visit('/admin');

  andThen(function() {
    assert.contains('.test-addons-needing-categorization h2', 'Addons needing categorization (10 / 11)', 'displays the correct number of addons in the header');
  });

  click('.test-addons-needing-categorization a:contains(Show)');

  andThen(function() {
    assert.equal(find('.test-addons-needing-categorization .addon-list li').length, 10, 'displays the correct number of addons');
  });
});

test('"Addons needing review" section does not include WIP addons', function(assert) {
  server.createList('addon', 10);
  server.create('addon', { is_wip: true });

  login();
  visit('/admin');

  andThen(function() {
    assert.contains('.test-addons-needing-review h2', 'Addons needing review (10 / 11)', 'displays the correct number of addons in the section header');
  });

  click('.test-addons-needing-review a:contains(Show)');

  andThen(function() {
    assert.equal(find('.test-addons-needing-review .addon-list li').length, 10, 'displays the correct number of addons');
  });
});

test('"Addons with new updates since last review" section does not include addons with no review', function(assert) {
  server.createList('addon', 5, {
    latest_version_date: window.moment().subtract(2, 'months'),
    latest_reviewed_version_date: window.moment().subtract(3, 'months')
  });
  server.createList('addon', 6);

  login();
  visit('/admin');

  andThen(function() {
    assert.contains('.test-addons-with-new-updates h2', 'Addons with new updates since last review (5 / 11)', 'displays the correct number of addons in the section header');
  });

  click('.test-addons-with-new-updates a:contains(Show)');

  andThen(function() {
    assert.equal(find('.test-addons-with-new-updates .addon-list li').length, 5, 'show the correct number of addons in the list');
  });
});

test('"WIP addons" section includes only WIP addons', function(assert) {
  server.createList('addon', 5);
  server.createList('addon', 6, { is_wip: true });
});
