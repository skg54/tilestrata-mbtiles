var tilestrata = require('tilestrata');
var TileServer = tilestrata.TileServer;
var TileRequest = tilestrata.TileRequest;
var imageSize = require('image-size');
var mbtiles = require('../index.js');
var assert = require('chai').assert;
var fs = require('fs');

describe('Provider Implementation "mbtiles"', function() {
	describe('serve()', function() {
		it('should render tile', function(done) {
			var server = new TileServer();
			var req = TileRequest.parse('/layer/0/0/0/tile.png');

			var provider = mbtiles({pathname: __dirname + '/data/gainesville_florida.mbtiles'});
			assert.equal(provider.name, 'mbtiles');
			provider.init(server, function(err) {
				if (err) throw err;
				provider.serve(server, req, function(err, buffer, headers) {
					if (err) throw err;
					assert.deepEqual(headers, {'Content-Type': 'image/png'});
					assert.instanceOf(buffer, Buffer);

					var im_actual = buffer.toString('base64');
					var im_expected = fs.readFileSync(__dirname + '/fixtures/world.png').toString('base64');
					assert.equal(im_actual, im_expected);

					done();
				});
			});
		});
		it('should acknowledge "tileSize" option', function(done) {
			var server = new TileServer();
			var req = TileRequest.parse('/layer/0/0/0/tile.png');

			var provider = mbtiles({pathname: __dirname + '/data/gainesville_florida.mbtiles', tileSize: 512, scale: 2});
			provider.init(server, function(err) {
				if (err) throw err;
				provider.serve(server, req, function(err, buffer, headers) {
					if (err) throw err;
					assert.deepEqual(headers, {'Content-Type': 'image/png'});
					assert.instanceOf(buffer, Buffer);
					var resultSize = imageSize(buffer);
					assert.equal(resultSize.width, 512, 'actual width');
					assert.equal(resultSize.height, 512, 'actual height');
					done();
				});
			});
		});
		it('should render interactivity tiles', function(done) {
			var server = new TileServer();
			var req = TileRequest.parse('/layer/0/0/0/tile.json');

			var provider = mbtiles({pathname: __dirname + '/data/gainesville_florida.mbtiles', interactivity: true});
			provider.init(server, function(err) {
				if (err) throw err;
				provider.serve(server, req, function(err, buffer, headers) {
					if (err) throw err;
					assert.deepEqual(headers, {'Content-Type': 'application/json'});
					assert.instanceOf(buffer, Buffer);

					var data_actual = buffer.toString('base64');
					var data_expected = fs.readFileSync(__dirname + '/fixtures/world.json').toString('base64');
					assert.equal(data_actual, data_expected);

					done();
				});
			});
		});
	});
});
