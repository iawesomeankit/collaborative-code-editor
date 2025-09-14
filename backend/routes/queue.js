// const express = require("express");
// const amqplib = require('amqplib');

// async function connectToRabbitMQ() {
// 	try {
// 		const connection = await amqplib.connect(process.env.RABBITMQ_URL);
// 		const channel = await connection.createChannel();
// 		const queue = 'task_queue';
// 		await channel.assertQueue(queue, { durable: true });
// 		const ch2 = await connection.createChannel();

// 		// setInterval(() => {
// 		// 	ch2.sendToQueue(queue, Buffer.from('something to do ankit'));
// 		// }, 1000);

// 		channel.consume(queue, (msg) => {
// 			if (msg !== null) {
// 				console.log('Received:', msg.content.toString());
// 				channel.ack(msg);
// 			} else {
// 				console.log('Consumer cancelled by server');
// 			}
// 		});
// 	} catch (error) {
// 		console.error("Error connecting to RabbitMQ:", error);
// 		throw error;
// 	}
// }

// module.exports = { connectToRabbitMQ };