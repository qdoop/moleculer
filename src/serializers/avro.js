/*
 * moleculer
 * Copyright (c) 2017 Ice Services (https://github.com/ice-services/moleculer)
 * MIT Licensed
 */

"use strict";

const BaseSerializer = require("./base");
const P = require("../packets");

function createSchemas() {
	const avro = require("avsc");
	const schemas = {};

	schemas[P.PACKET_EVENT] = avro.Type.forSchema({
		name: P.PACKET_EVENT,
		type: "record",
		fields: [
			{ name: "sender", type: "string" },
			{ name: "event", type: "string" },
			{ name: "data", type: "string" }
		]
	});

	schemas[P.PACKET_REQUEST] = avro.Type.forSchema({
		name: P.PACKET_REQUEST,
		type: "record",
		fields: [
			{ name: "sender", type: "string" },
			{ name: "id", type: "string" },
			{ name: "action", type: "string" },
			{ name: "params", type: "string" },
			{ name: "meta", type: "string" },
			{ name: "timeout", type: "double" },
			{ name: "level", type: "int" },
			{ name: "metrics", type: "boolean" },
			{ name: "parentID", type: [ "null", "string"], default: null }
		]
	});

	schemas[P.PACKET_RESPONSE] = avro.Type.forSchema({
		name: P.PACKET_RESPONSE,
		type: "record",
		fields: [
			{ name: "sender", type: "string" },
			{ name: "id", type: "string" },
			{ name: "success", type: "boolean" },
			{ name: "data", type: [ "null", "string"] },
			{ name: "error", type: [ "null", {
				type: "record",
				fields: [
					{ name: "name", type: "string" },
					{ name: "message", type: "string" },
					{ name: "code", type: "int" },
					{ name: "type", type: "string" },
					{ name: "stack", type: "string" },
					{ name: "data", type: "string" },
					{ name: "nodeID", type: "string" }
				]
			} ], default: null }
		]
	});

	schemas[P.PACKET_DISCOVER] = avro.Type.forSchema({
		name: P.PACKET_DISCOVER,
		type: "record",
		fields: [
			{ name: "sender", type: "string" }
		]
	});

	schemas[P.PACKET_INFO] = avro.Type.forSchema({
		name: P.PACKET_INFO,
		type: "record",
		fields: [
			{ name: "sender", type: "string" },
			{ name: "services", type: "string" },
			{ name: "uptime", type: "double" },
			{ name: "ipList", type: {
				type: "array",
				items: "string"
			}},
			{ name: "versions", type: {
				type: "record",
				fields: [
					{ name: "node", type: "string" },
					{ name: "moleculer", type: "string" }
				]
			}}
		]
	});

	schemas[P.PACKET_DISCONNECT] = avro.Type.forSchema({
		name: P.PACKET_DISCONNECT,
		type: "record",
		fields: [
			{ name: "sender", type: "string" }
		]
	});

	schemas[P.PACKET_HEARTBEAT] = avro.Type.forSchema({
		name: P.PACKET_HEARTBEAT,
		type: "record",
		fields: [
			{ name: "sender", type: "string" },
			{ name: "uptime", type: "double" }
		]
	});

	return schemas;
}

/**
 * Avro serializer for Moleculer
 * 
 * https://github.com/mtth/avsc
 * 
 * @class AvroSerializer
 */
class AvroSerializer extends BaseSerializer {

	/**
	 * Initialize Serializer
	 * 
	 * @param {any} broker
	 * 
	 * @memberOf Serializer
	 */
	init(broker) {
		super.init(broker);

		try {
			require("avsc");
		} catch(err) {
			/* istanbul ignore next */
			this.broker.fatal("The 'avsc' package is missing! Please install it with 'npm install avsc --save' command!", err, true);
		}		

		this.schemas = createSchemas(broker);
	}

	/**
	 * Serializer a JS object to Buffer
	 * 
	 * @param {Object} obj
	 * @param {String} type of packet
	 * @returns {Buffer}
	 * 
	 * @memberOf Serializer
	 */
	serialize(obj, type) {
		const t = this.schemas[type].toBuffer(obj);
		return t;
	}

	/**
	 * Deserialize Buffer to JS object
	 * 
	 * @param {Buffer} buf
	 * @param {String} type of packet
	 * @returns {Object}
	 * 
	 * @memberOf Serializer
	 */
	deserialize(buf, type) {
		const res = this.schemas[type].fromBuffer(buf);
		return res;
	}
}

module.exports = AvroSerializer;