import Ember from 'ember';
import { module, test } from 'qunit';
import startApp from 'ember-addon-review/tests/helpers/start-app';

var application;

module('Acceptance: admin', {
  beforeEach: function() {
    application = startApp();
  },

  afterEach: function() {
    Ember.run(application, 'destroy');
  }
});

test('visiting /admin not logged in', function(assert) {
  visit('/admin');
  andThen(function() {
    assert.equal(currentURL(), '/', 'redirects to index');
  });
});

test('visiting /admin', function(assert) {
  assert.expect(2);
  var done = assert.async();

  server.post('/authentication/login.json', function(db, request) {
    assert.equal(request.requestBody, 'email=test%40example.com&password=password123');
    done();
    return {
      token: 'abc123'
    };
  });

  visit('/login');
  fillIn('.test-email', 'test@example.com');
  fillIn('.test-password', 'password123');
  click('.test-log-in');
  visit('/admin');
  andThen(function() {
    assert.equal(currentURL(), '/admin', 'Does not redirect');
  });
});

test('reviewing addons', function(assert) {
  assert.expect(7);

  var addon = server.create('addon', {
    name: 'test-addon'
  });

  var review = server.create('review', {
    addon_id: addon.id,
    has_tests: 1,
    has_readme: 4,
    is_more_than_empty_addon: 3,
    is_open_source: 2,
    has_build: 1,
    review: 'Seems ok'
  });

  server.create('version', {
    addon_id: addon.id,
    review_id: review.id,
    released: window.moment().subtract(3, 'months')
  });

  var latestVersion = server.create('version', {
    addon_id: addon.id,
    released: window.moment().subtract(1, 'months')
  });

  server.create('category', {
    name: 'Category1',
    addon_ids: [addon.id]
  });

  server.post('/reviews', function(db, request) {
    var data = JSON.parse(request.requestBody).review;
    assert.equal(data.review, '#Some Review');
    assert.equal(data.version_id, latestVersion.id);
    assert.equal(data.has_build, 3);
    assert.equal(data.has_readme, 1);
    assert.equal(data.has_tests, 2);
    assert.equal(data.is_more_than_empty_addon, 1);
    assert.equal(data.is_open_source, 1);
    let review = server.create('review', data);
    return { review: review };
  });

  login();

  visit(`/addons/${addon.name}`);
  click('.test-addon-review-button');
  answerQuestion('Is the source accessible?', 'Yes');
  answerQuestion('Is it more than an empty addon?', 'Yes');
  answerQuestion('Are there meaningful tests?', 'No');
  answerQuestion('Is the README filled out?', 'Yes');
  answerQuestion('Does the addon have a build?', 'N/A');
  fillIn('.test-addon-review-notes', '#Some Review');
  click('.test-addon-review-save');
});

function answerQuestion(question, answer) {
  click(`li .question:contains("${question}") ~ .test-question-buttons button:contains(${answer})`);
}

test('renewing a review', function(assert) {
  assert.expect(7);

  var addon = server.create('addon', {
    name: 'test-addon'
  });

  var review = server.create('review', {
    addon_id: addon.id,
    has_tests: 1,
    has_readme: 4,
    is_more_than_empty_addon: 3,
    is_open_source: 2,
    has_build: 1,
    review: 'Seems ok'
  });

  server.create('version', {
    addon_id: addon.id,
    review_id: review.id,
    released: window.moment().subtract(3, 'months')
  });

  var latestVersion = server.create('version', {
    addon_id: addon.id,
    released: window.moment().subtract(1, 'months')
  });

  server.post('/reviews', function(db, request) {
    var data = JSON.parse(request.requestBody).review;
    assert.equal(data.version_id, latestVersion.id);
    assert.equal(data.has_tests, 1);
    assert.equal(data.has_readme, 4);
    assert.equal(data.is_more_than_empty_addon, 3);
    assert.equal(data.is_open_source, 2);
    assert.equal(data.has_build, 1);
    assert.equal(data.review, 'Seems ok');
    let review = server.create('review', data);
    return { review: review };
  });

  login();

  visit(`/addons/${addon.name}`);
  click('.test-renew-latest-review');
});
