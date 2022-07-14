const fs = require('fs');
const { Blob, Buffer } = require('node:buffer');
const http = require('http');
const https = require('https');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { futimesSync } = require('fs');
const { apiToken, threadArchiveDureation, hacktheboxChannelID, announcementOrGeneralChannelID, memberRoleID, adminRoleID } = require('./../config.json');

const htbchanid = hacktheboxChannelID
const htbtoken  = apiToken

const capitalize = (s) => {
	if (typeof s !== 'string') return ''
	return s.charAt(0).toUpperCase() + s.slice(1)
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('htb')
		.setDescription('HTB channel command')
		.addSubcommand(subcommand =>
			subcommand
				.setName('challenge')
				.setDescription('Grab a HTB Challenge, so we can have some fun!')
				.addStringOption(option => option.setName('name').setDescription('Challenge name').setRequired(true)))
		.addSubcommand(subcommand =>
			subcommand
				.setName('info')
				.setDescription('Grab online information on a HTB Machine')
				.addStringOption(option => option.setName('name').setDescription('Machine name').setRequired(true)))
		.addSubcommand(subcommand =>
			subcommand
				.setName('list')
				.setDescription('List THUGS(red) HTB machine writeups'))
		.addSubcommand(subcommand =>
			subcommand
				.setName('start')
				.setDescription('Begin work on a HTB machine writeup!')
				.addStringOption(option => option.setName('name').setDescription('Machine name').setRequired(true)))
		.addSubcommand(subcommand =>
			subcommand
				.setName('tapout')
				.setDescription('Tap out on a HTB machine writeup (Remove as collaborator)')
				.addStringOption(option => option.setName('name').setDescription('Machine name').setRequired(true)))
		.addSubcommand(subcommand =>
			subcommand
				.setName('tapin')
				.setDescription('Tap in on a HTB machine writeup (Join as collaborator)')
				.addStringOption(option => option.setName('name').setDescription('Machine name').setRequired(true)))
		.addSubcommand(subcommand =>
			subcommand
				.setName('solved')
				.setDescription('Mark the HTB machine writeup as SOLVED!')
				.addStringOption(option => option.setName('name').setDescription('Machine name').setRequired(true)))
		.addSubcommand(subcommand =>
			subcommand
				.setName('reopen')
				.setDescription('Reopen a solved HTB machine! (But why?)')
				.addStringOption(option => option.setName('name').setDescription('Machine name').setRequired(true)))
		.addSubcommand(subcommand =>
			subcommand
				.setName('plzhelp')
				.setDescription('Send a cry for help in #general (Cry baby!)'))
		.addSubcommand(subcommand =>
			subcommand
				.setName('stats')
				.setDescription('Show some fun ranking stats from Hack The Box!'))
		.addSubcommand(subcommand =>
			subcommand
				.setName('bot-joinall')
				.setDescription('(Admin command) Make sure the bot is joined in on all writeups')),
	async execute(interaction,discord) {
		const { commandName } = interaction;
		const htbchan = discord.channels.cache.get(hacktheboxChannelID);

		// For future use
		flagCodes = {
			"a": "🇦",
			"b": "🇧",
			"c": "🇨",
			"d": "🇩",
			"e": "🇪",
			"f": "🇫",
			"g": "🇬",
			"h": "🇭",
			"i": "🇮",
			"j": "🇯",
			"k": "🇰",
			"l": "🇱",
			"m": "🇲",
			"n": "🇳",
			"o": "🇴",
			"p": "🇵",
			"q": "🇶",
			"r": "🇷",
			"s": "🇸",
			"t": "🇹",
			"u": "🇺",
			"v": "🇻",
			"w": "🇼",
			"x": "🇽",
			"z": "🇿",
			"y": "🇾",
		}

		console.log("[HTB]: Command handler - Called as: "+interaction.options.getSubcommand() ) // Let's spam the terminal a little :)

		if (interaction.options.getSubcommand() === 'bot-joinall') {
			const isAdmin = interaction.member.roles.cache.some(r => r.id === adminRoleID)
			const isMember = interaction.member.roles.cache.some(r => r.id === memberRoleID)
			const thugsGeneralChan = discord.channels.cache.get(announcementOrGeneralChannelID);
			const thugsHTBChan = discord.channels.cache.get(hacktheboxChannelID);

			if ( isAdmin ) {
				interaction.reply("Check your debug console ...")
				let threadsActive = await htbchan.threads.fetchActive()
				let threadsArchived = await htbchan.threads.fetchArchived()
				threadsActive.threads?.forEach(gotthread => { 
					console.log("JOINED - "+gotthread.name)
					gotthread.join();
				});
				threadsArchived.threads?.forEach(gotthread => { 
					console.log("JOINED - "+gotthread.name)
					gotthread.join();
				});
			}
		}

		if (interaction.options.getSubcommand() === 'challenge') {
			interaction.deferReply();

			const isAdmin = interaction.member.roles.cache.some(r => r.id === adminRoleID)
			const isMember = interaction.member.roles.cache.some(r => r.id === memberRoleID)
			const thugsGeneralChan = discord.channels.cache.get(announcementOrGeneralChannelID);
			const thugsHTBChan = discord.channels.cache.get(hacktheboxChannelID);
			const lookupChallengeName = encodeURIComponent(interaction.options.getString('name').toLowerCase());

			let url_challenge = "https://www.hackthebox.com/api/v4/challenge/info/"+lookupChallengeName
			var options = {
				method: 'GET',
				headers:{
					'Authorization':'Bearer '+htbtoken,
					'Accept': 'application/json'
			   }
			};
			https.get(url_challenge,options,(res) => {
				let body = "";
				let code = res.statusCode

				res.on("data", (chunk) => {
					body += chunk;
				});	
				res.on("end", (code) => {
					try {
						if ( res.statusCode == "200") {
							var json = JSON.parse(body);
							
							const challengeID = json.challenge.id
							const challengeName = json.challenge.name
							const challengeDifficulty = json.challenge.difficulty
							const challengeDescription = json.challenge.description
							const challengeCategory = json.challenge.category_name

							const challengePoints = json.challenge.points
							const challengeLikes = json.challenge.likes
							const challengeDisLikes = json.challenge.dislikes
							const challengeSolves = json.challenge.solves

							const isDocker = json.challenge.docker
							const dockerIp = json.challenge.docker_ip
							const dockerPort = json.challenge.docker_port
							const isDownload = json.challenge.download
							const isRetired = json.challenge.retired

							const fileUrl = "https://www.hackthebox.com/api/v4/challenge/download/"+challengeID


							if ( isRetired ) {
								interaction.editReply("Sorry but HTB "+challengeCategory+" Challenge **"+challengeName+"** is retired, no sense in solving it!")
							} else {
								if ( isDocker && dockerIp == null && dockerPort == null ) {
									interaction.editReply("<@"+interaction.user.id+"> the HTB challenge **"+challengeName+"** is a Docker instance challenge.\nSo please login to HTB, go under Challenges and click `Start Instance` on the **"+challengeName+"** challenge.\n🔄 Then re-run command: `/htb challenge "+lookupChallengeName+"`")
								} else {
									// Docker challenges might also have download !!
									// #### THIS IS A CHALLENGE DOCKER AND/OR DOCKER+DOWNLOAD
									if ( isDocker || isDocker && isDownload ) {
										// Make sure again !
										if ( dockerIp == null || dockerPort == null ) {
											interaction.editReply("<@"+interaction.user.id+"> the HTB challenge **"+challengeName+"** is a Docker instance challenge.\nGo to <https://app.hackthebox.com/challenges/"+challengeID+"> and make sure its fully started!\n🔄 Then re-run command: `/htb challenge "+lookupChallengeName+"`")
										} else {
											// DOCKER READY
											// SHOW faNCY EMBED ...
											// #### THIS IS A CHALLENGE DOCKER+DOWNLOAD
											if ( isDownload ) {
												console.log("HTB Challenge (docker+download): "+challengeName)
												// Download and do it like we know !
												var options = { method: 'GET', headers:{'Authorization':'Bearer '+htbtoken,'Accept': 'application/json' }};
												https.get(fileUrl,options,(res) => {
													let body = "";
													let code = res.statusCode
													res.on("data", (chunk) => {
														body += chunk;
													});	
													res.on("end", (code) => {
														try {
															if ( res.statusCode == "200") {
																const fileName = res.headers['content-disposition'].split('filename=')[1].split(';')[0];
																fileInfo = {
																	name: fileName,
																	mime: res.headers['content-type'],
																	size: parseInt(res.headers['content-length'], 10),
																};
																const fileBuffer = Buffer.alloc(fileInfo.size, body);
																interaction.editReply({
																	"content": "**🧩 Hack The Box - "+challengeCategory+" Challenge: "+challengeName+"**\n**🏋️ Difficulty:** "+challengeDifficulty+" **|** **🏆 Solves:** "+challengeSolves+" **|** **👍 Likes:** "+challengeLikes+" **|** **👎 Dislikes:** "+challengeDisLikes+"\n\n> **Description:**\n> "+challengeDescription+"\n\n> **Remote machine IP:** "+dockerIp+"\n> **Remote machine Port:** "+dockerPort+"\n\n*You need to find a flag like:* `HTB{s0me_TexT}`\n*Zip file password is:* `hackthebox`",
																	"embeds": [],
																	"attachments": [],
																	"files": [ 
																		{ attachment: fileBuffer, name: fileInfo.name }
																	]
																})
															}
														} catch (error) {
															console.error(error.message);
														};
													});
												}).on("error", (error) => {
													console.error(error.message);
												});
											// #### THIS IS A CHALLENGE DOCKER ONLY
											} else {
												console.log("HTB Challenge (docker): "+challengeName)
												interaction.editReply("**🧩 Hack The Box - "+challengeCategory+" Challenge: "+challengeName+"**\n**🏋️ Difficulty:** "+challengeDifficulty+" **|** **🏆 Solves:** "+challengeSolves+" **|** **👍 Likes:** "+challengeLikes+" **|** **👎 Dislikes:** "+challengeDisLikes+"\n\n> **Description:**\n> "+challengeDescription+"\n\n> **Remote machine IP:** "+dockerIp+"\n> **Remote machine Port:** "+dockerPort+"\n\n*You need to find a flag like:* `HTB{s0me_TexT}`")
											}
										}
									// #### THIS IS A CHALLENGE DOWNLOAD ONLY
									} else if ( isDownload && !isDocker ) {
										console.log("HTB Challenge (download): "+challengeName)
										var options = { method: 'GET', headers:{'Authorization':'Bearer '+htbtoken,'Accept': '*/*' }};
										let bufs = [];
										let buf = Uint8Array;
										https.get(fileUrl,options,(res) => {
											let body = "";
											let code = res.statusCode
											res.on("data", (chunk) => {
												bufs.push(chunk);
											});	
											res.on("end", (code) => {
												try {
													if ( res.statusCode == "200") {
														const fileName = res.headers['content-disposition'].split('filename=')[1].split(';')[0];
														fileInfo = {
															name: fileName,
															mime: res.headers['content-type'],
															size: parseInt(res.headers['content-length'], 10),
														};
														//const blob = new Blob(body, {type: fileInfo.mime})
														//const fileBuffer = Buffer.alloc(fileInfo.size, buf);
														buf = Buffer.concat(bufs);
														if ( fileInfo.size > 10000000 ) {
															interaction.editReply({
																"content": "**🧩 Hack The Box - "+challengeCategory+" Challenge: "+challengeName+"**\n**🏋️ Difficulty:** "+challengeDifficulty+" **|** **🏆 Solves:** "+challengeSolves+" **|** **👍 Likes:** "+challengeLikes+" **|** **👎 Dislikes:** "+challengeDisLikes+"\n\n> **Description:**\n> "+challengeDescription+"\n\n⚠️ Warning ⚠️ - File size is larger than 100MB and can't be uploaded to Discord!\n⚠️ Warning ⚠️ - Please goto <https://app.hackthebox.com/challenges/"+challengeID+"> and click `Download files`\n\n*You need to find a flag like:* `HTB{s0me_TexT}`\n*Zip file password is:* `hackthebox`",
																"embeds": [],
																"attachments": [],
															})
														} else {
															interaction.editReply({
																"content": "**🧩 Hack The Box - "+challengeCategory+" Challenge: "+challengeName+"**\n**🏋️ Difficulty:** "+challengeDifficulty+" **|** **🏆 Solves:** "+challengeSolves+" **|** **👍 Likes:** "+challengeLikes+" **|** **👎 Dislikes:** "+challengeDisLikes+"\n\n> **Description:**\n> "+challengeDescription+"\n\n*You need to find a flag like:* `HTB{s0me_TexT}`\n*Zip file password is:* `hackthebox`",
																"embeds": [],
																"attachments": [],
																"files": [
																	{ attachment: buf, name: fileInfo.name }
																]
															})
														}
														
													}
												} catch (error) {
													console.error(error.message);
												};
											});
										}).on("error", (error) => {
											console.error(error.message);
										});
									} else {
										interaction.editReply("Uhm - challenge seems broken ...")
									}
								}
							}
						} else {
							interaction.editReply("Sorry, could not find any HTB "+challengeCategory.toLowerCase()+" challenges with the name: **"+lookupChallengeName+"**");
						}
					} catch (error) {
						console.error(error.message);
					};
				});
			}).on("error", (error) => {
				console.error(error.message);
			});
		}

		if (interaction.options.getSubcommand() === 'stats') {
			interaction.reply(" Try again later, not implemented yet!")
		}

		if (interaction.options.getSubcommand() === 'plzhelp') {
			interaction.reply(flagCodes.a+flagCodes.u+" Try again later, not implemented yet!")
		}

		if (interaction.options.getSubcommand() === 'solved') {
			const pubchan = discord.channels.cache.get(announcementOrGeneralChannelID);
			const htbchan = discord.channels.cache.get(hacktheboxChannelID);

			const machine = capitalize(interaction.options.getString('name'));
			const thread = htbchan.threads.cache.find(x => x.name.toLowerCase() === "machine-"+machine.toLowerCase() );
			//console.log(thread)
			if ( thread ) {
				if ( !thread.locked ) {
					console.log("Solved: "+machine)
					if ( interaction.channel.id != pubchan.id ) pubchan.send("🚩🚩 <#"+thread.id+"> 🚩🚩 **is solved!** 💯 🎉 🏁 🥈 🥇 ✌️✌️\n<@"+interaction.user.id+"> has marked this writeup as solved and the user/system was fully pwned")
					if ( interaction.channel.id != thread.id ) interaction.reply("**Hold on to your hats!** 🎩🎉🥳 <@"+interaction.user.id+"> has marked <#"+thread.id+"> as **SOLVED!** 🥈🥇 ✌️")
					thread.send("**🚩🚩 SOVLED 🚩🚩 💯 🎉 🏁🥈🥇 ✌️✌️ <@"+interaction.user.id+"> has marked this writeup as solved ✌️✌️**\nI have now archived and locked this thread - Use: /htb reopen "+machine)
					thread.setLocked(true)
					thread.setArchived(true)
				} else {
					interaction.reply("Sorry but <#"+thread.id+"> is already solved ⁉️")
				}
			} else {
				interaction.reply("Sorry i don't think we have a writeup on '**"+machine+"**' ⁉️")
			}
		}

		if (interaction.options.getSubcommand() === 'reopen') {
			const machine = capitalize(interaction.options.getString('name'));
			const thread = htbchan.threads.cache.find(x => x.name.toLowerCase() === "machine-"+machine.toLowerCase() );
			if ( thread ) {
				//console.log(thread)
				if ( thread.locked ) {
					console.log("Reopen: "+machine)
					interaction.reply("<@"+interaction.user.id+"> has asked to re-open <#"+thread.id+"> from the archives 🗃️🔓\nPlease note it's no longer marked as solved! 😥")
					thread.send("**<@"+interaction.user.id+"> has asked to re-open <#"+thread.id+"> from the archives** 🗃️🔓\nPlease note that this writeup is no longer marked as solved! 😥")
					thread.setLocked(false)
					thread.setArchived(false)
				} else {
					interaction.reply("Sorry but <#"+thread.id+"> has not yet been solved ⁉️")
				}
			} else {
				interaction.reply("Sorry i don't think we have a writeup on '**"+machine+"**' ⁉️")
			}
		}

		if (interaction.options.getSubcommand() === 'tapout') {
			const machine = capitalize(interaction.options.getString('name'));
			const thread = htbchan.threads.cache.find(x => x.name.toLowerCase() === "machine-"+machine.toLowerCase() );
			//console.log(thread)
			if ( thread ) {
				if ( thread.archived && thread.locked ) {
					interaction.reply("Hey <@"+interaction.user.id+"> HTB <#"+thread.id+"> writeup is already **solved**! 🥈🥇\nI will **not remove** you as an final collaborator 🏆")
				} else if ( thread.archived && !thread.locked ) {
					interaction.reply("Hey <@"+interaction.user.id+"> looks like HTB <#"+thread.id+"> writeup had to little activity and went off to the archives 🗃️🗃️\nNo need to tap out ...")
				} else {
					console.log("Tap out: "+machine)
					thread.members.remove(interaction.user.id)
					interaction.reply("<@"+interaction.user.id+"> so you're throwing in the towel on <#"+thread.id+"> ⁉️\nThat's the way the cookie crumbles 🍪🍪💨")
					thread.send("🏳️🏳️ <@"+interaction.user.id+"> tapped out 😵‍💫😵 In great need of a break ⛱️🏝️ 🏳️🏳️\nPlease come back, your work is appreciated 🫶")
				}
			} else {
				interaction.reply("Sorry i don't think we have a writeup on '"+machine+"' ⁉️")
			}
		}

		if (interaction.options.getSubcommand() === 'tapin') {
			const machine = capitalize(interaction.options.getString('name'));
			const thread = htbchan.threads.cache.find(x => x.name.toLowerCase() === "machine-"+machine.toLowerCase() );
			//console.log(thread)
			if ( thread ) {
				if ( thread.archived && thread.locked ) {
					interaction.reply("Hey <@"+interaction.user.id+"> HTB <#"+thread.id+"> writeup is already **solved**! 🥈🥇\nI will **not add** you as an final collaborator 🤥")
				} else if ( thread.archived && !thread.locked ) {
					interaction.reply("Hey <@"+interaction.user.id+"> looks like HTB <#"+thread.id+"> writeup had to little activity and went off to the archives 🗃️🗃️\nYou need to `/htb start "+machine+"` if you want to take another go! 🫶")
				} else {
					console.log("Tap in: "+machine)
					thread.members.add(interaction.user.id)
					interaction.reply("<@"+interaction.user.id+"> has tapped in! 🥊 And is now a collaborator on HTB <#"+thread.id+"> 🤓😎")
					thread.send("🧑‍💻🧑‍💻 Welcome to <@"+interaction.user.id+"> as a collaborator 🧑‍💻🧑‍💻\nNow let's combine our brain 🧠 power and get this beast tamed 🤓😎")
				}
			} else {
				interaction.reply("Sorry i don't think we have a writeup on '"+machine+"' ⁉️")
			}
		}

		if (interaction.options.getSubcommand() === 'info') {

			const machine = capitalize(interaction.options.getString('name'));
			const lookup = interaction.options.getString('name').toLowerCase();

			let url_challenge = "https://www.hackthebox.com/api/v4/challenge/info/70"+machine.toLowerCase();
			let url_machine = "https://www.hackthebox.com/api/v4/machine/profile/"+machine.toLowerCase();

			var options = {
				method: 'GET',
				headers:{
					'Authorization':'Bearer '+htbtoken,
					'Accept': 'application/json'
			   }
			};

			console.log("URL: "+url_machine)

			https.get(url_machine,options,(res) => {
				let body = "";
				let code = res.statusCode
				res.on("data", (chunk) => {
					body += chunk;
				});	
				res.on("end", (code) => {
					try {
						if ( res.statusCode == "200") {
							json = JSON.parse(body);
							let active = "???"
							if ( json.info.active === 1) active = "Yes"
							if ( json.info.active === 0) active = "No"
							if ( json.info.retired === 1) active += " (retired)"
							rating = ""
							let stars = parseInt(json.info.stars)
							for (i=0; i < stars; i++ ) {
								rating = rating+"⭐"
							}
							if ( json.info.stars.indexOf(".") ) rating = rating+"✨"
							let timeofcommand = new Date();
							let releasedate = new Date( Date.parse(json.info.release) );
							const months = [
								'January',
								'February',
								'March',
								'April',
								'May',
								'June',
								'July',
								'August',
								'September',
								'October',
								'November',
								'December'
							]
							const year = releasedate.getFullYear()
							const month = releasedate.getDate()
							const day = releasedate.getDate()
							const monthName = months[releasedate.getMonth()]
							let releasedate_fancy = day+" "+monthName+" "+year
							interaction.reply({
								"content": null,
								"embeds": [
								{
									"title": "🖥️ Hack The Box - Machine: "+json.info.name,
									"description": "**OS:** "+json.info.os+" **|** **Difficulty:** "+json.info.difficultyText+" *("+json.info.difficulty+")* **|** **Rating:** "+rating,
									"url": "https://app.hackthebox.com/machines/"+json.info.name.toLowerCase(),
									"color": 14089984,
									"fields": [
									{
										"name": "🕹️ Active:",
										"value": active,
										"inline": true
									},
									{
										"name": "🎯 Points:",
										"value": json.info.points.toString(),
										"inline": true
									},
									{
										"name": "🤹 Author:",
										"value": json.info.maker.name.toString(),
										"inline": true
									},
									{
										"name": "🧯 USER pwn(s):",
										"value": json.info.user_owns_count.toString(),
										"inline": true
									},
									{
										"name": "🔥 SYSTEM pwn(s):",
										"value": json.info.root_owns_count.toString(),
										"inline": true
									},
									{
										"name": "📅 Release date:",
										"value": releasedate_fancy,
										"inline": true
									},
									{
										"name": "🩸🩸🩸 First Blood Information ! 🩸🩸🩸",
										"value": "➖"
									},
									{
										"name": "🥇 First \"USER\"",
										"value": json.info.userBlood.user.name.toString(),
										"inline": true
									},
									{
										"name": "➖",
										"value": "➖",
										"inline": true
									},
									{
										"name": "🥇 First \"SYSTEM\"",
										"value": json.info.rootBlood.user.name.toString(),
										"inline": true
									},
									{
										"name": "⏱️ After",
										"value": json.info.userBlood.blood_difference.toString(),
										"inline": true
									},
									{
										"name": "➖",
										"value": "➖",
										"inline": true
									},
									{
										"name": "⏱️ After",
										"value": json.info.rootBlood.blood_difference.toString(),
										"inline": true
									}
									],
									"thumbnail": {
									"url": "https://www.hackthebox.com"+json.info.avatar
									}
								}
								],
								"attachments": []
							})
						} else {
							interaction.reply("Sorry, could not find any machines with the name '"+machine+"'");
						}
					} catch (error) {
						console.error(error.message);
					};
				});
			}).on("error", (error) => {
				console.error(error.message);
			});
		}

		if (interaction.options.getSubcommand() === 'list') {
			//console.log(htbchan)
			let threadsActive = await htbchan.threads.fetchActive()
			let threadsArchived = await htbchan.threads.fetchArchived()
			var writeups = []
			for (const [key, value] of Object.entries(threadsActive)) {
				if ( key == "threads") {
					console.log("= THREADS =");
					let arr = Array.from(value.values())
					for ( const tt in arr ) {
						// Only do actual machines and not challenges or other junk :)
						if ( arr[tt].name.includes("Machine-") ) {
							console.log( "[  ACTIVE] HTB Machine Name: " + arr[tt].name )
							var thisWriteup = {
								"name": arr[tt].name.replace("Machine-",""),
								"solved": arr[tt].locked,
								"notes": arr[tt].messageCount,
								"collaborators": arr[tt].memberCount,
								"archived": arr[tt].archived
							}
							writeups.push(thisWriteup)
						}
					}
				}	
			}
			for (const [key, value] of Object.entries(threadsArchived)) {
				if ( key == "threads") {
					console.log("= THREADS =");
					let arr = Array.from(value.values())
					for ( const tt in arr ) {
						// Only do actual machines and not challenges or other junk :)
						if ( arr[tt].name.includes("Machine-") ) {
							var thisWriteup = {
								"name": arr[tt].name.replace("Machine-",""),
								"solved": arr[tt].locked,
								"notes": arr[tt].messageCount,
								"collaborators": arr[tt].memberCount,
								"archived": arr[tt].archived
							}
							writeups.push(thisWriteup)
							console.log( "[ARCHIVED] THB Machine Name: " + arr[tt].name )
						}
					}
				}	
			}
			await interaction.reply("**THUGS(red) - Hack The Box WriteUps** *(Interact with them via /htb command!)*\n🖥️=OS, 🏋️=Difficulty, 🧑‍💻=Collaborators, 📊=Activity/Messages, 🔵=Active, ⚪=Archived, 🏆💯=Solved!");
			writeups.forEach(( writeup ) => {
				let url_challenge = "https://www.hackthebox.com/api/v4/challenge/info/70"+writeup.name.toLowerCase();
				let url_machine = "https://www.hackthebox.com/api/v4/machine/profile/"+writeup.name.toLowerCase();
				console.log("Getting: "+url_machine)
				var options = {
					method: 'GET',
					headers:{
						'Authorization':'Bearer '+htbtoken,
						'Accept': 'application/json'
					},
					"writeup": writeup
				};
				https.get(url_machine,options,(res) => {
					let body = "";
					let code = res.statusCode
					res.on("data", (chunk) => {
						body += chunk;
					});
					res.on("end", () => {
						//console.log("HTTP Return code: "+code)
						if ( code == "200" ) {
							try {
								//console.log("TEST TEST: "+thiswriteup.name)
								json = JSON.parse(body);
								var os = json.info.os.padEnd(8," ")
								var diff = json.info.difficultyText.padEnd(11," ")
								var fancyName = json.info.name.padEnd(20," ")
								var solved = options.writeup.solved ? '🏆💯' : ''
								var old = options.writeup.archived ? '⚪' : '🔵'
								var col = options.writeup.collaborators
								var msgnum = options.writeup.notes
								var msg = "```yml\n🕹️ "+fancyName+" [ 🖥️ = "+os+", 🏋️ = "+diff+" ] 🧑‍💻🧑‍💻🧑‍💻 = "+col.toString().padEnd(3," ")+" 📊 = "+msgnum.toString().padEnd(3," ")+" |  "+old+"  "+solved+"```"
								//console.log(msg)
								interaction.channel.send(msg)
							} catch (error) {
								console.error(error.message);
							};
						} else {
							//var msg = "```yml\n"+writeup.name+" could not be fetched from HTB api, something went wrong!```"
							//interaction.channel.send(msg)
						}
					});
				}).on("error", (error) => {
					console.error(error.message);
				});
			})
		}

		if (interaction.options.getSubcommand() === 'start') {
			const machine = capitalize(interaction.options.getString('name'));
			const newthreadname = "Machine-"+machine;
			const foundthread = htbchan.threads.cache.find(x => x.name.toLowerCase() === newthreadname.toLowerCase() );
			console.log("[HTB] --- Create new machine/Challenge ---")
			let url_machine = "https://www.hackthebox.com/api/v4/machine/profile/"+machine.toLowerCase();
			var options = {
				method: 'GET',
				headers:{
					'Authorization':'Bearer '+htbtoken,
					'Accept': 'application/json'
			   }
			};
			https.get(url_machine,options,(res) => {
				let body = "";
				let code = res.statusCode
				console.log("HTTP CODE (inside): "+res.statusCode)
				//console.log("headers: ", res.headers);
				res.on("data", (chunk) => {
					body += chunk;
				});
				res.on("end", () => {
					try {
						//console.log(body)
						json = JSON.parse(body);
						if ( foundthread ) console.log("%%% 2 THREAD FOUND!! ")
						makeWriteup(code,json)
					} catch (error) {
						console.error(error.message);
					};
				});
			}).on("error", (error) => {
				console.error(error.message);
			});

			async function makeWriteup(code,json) {
				var known = false;
				//const machine = capitalize(interaction.options.getString('name'));
				const machine = json.info.name;
				const newthreadname = "Machine-"+machine;
				const htbchan = discord.channels.cache.get(hacktheboxChannelID);
				const pubchan = discord.channels.cache.get(announcementOrGeneralChannelID);
				let active_threads = await htbchan.threads.fetchActive()
				let archived_threads = await htbchan.threads.fetchArchived()
				for (const [key, value] of Object.entries(active_threads)) {
					if ( key == "threads") {
						let arr = Array.from(value.values())
						for ( const tt in arr ) {
							if ( arr[tt].name.toLowerCase() === newthreadname.toLocaleLowerCase() ) known = true
							console.log( "[  ACTIVE] HTB Machine Name: " + arr[tt].name )
						}
					}	
				}
				for (const [key, value] of Object.entries(archived_threads)) {
					if ( key == "threads") {
						let arr = Array.from(value.values())
						for ( const tt in arr ) {
							if ( arr[tt].name.toLowerCase() === newthreadname.toLocaleLowerCase() ) known = true
							console.log( "[ARCHIVED] THB Machine Name: " + arr[tt].name )
						}
					}	
				}
				const foundthread = await htbchan.threads.cache.find(x => x.name.toLowerCase() === newthreadname.toLowerCase() );
				if ( known ) {
					console.log("[HTB] New > Sorry but i already have that thread! ( "+newthreadname+" )")
					console.log("[HTB] New > I will unarchive it instead!")
					console.log("[HTB] Unarhived thread: "+newthreadname)
				
					// <@"+interaction.user.id+"> <#"+thread.id+">
					// Solved will always archive and lock the thread!
					if (foundthread.archived && foundthread.locked) {
						// OLD + SOLVED
						if (foundthread.joinable) {
							if (!foundthread.joined) await foundthread.join();
						}
						await interaction.reply("Sorry <@"+interaction.user.id+"> but that HTB <#"+foundthread.id+"> writeup is already **SOLVED** 🚩🚩\n👀 You can look at it, but you can't collaborate in it anymore ...");
					} else if (foundthread.archived && !foundthread.locked) {
						// OLD (just not worked on anymore?)
						await foundthread.setArchived(false);
						if (foundthread.joinable) {
							if (!foundthread.joined) await foundthread.join();
						}
						await foundthread.members.add(interaction.user.id)
						await interaction.reply("Sorry <@"+interaction.user.id+"> but looks like that HTB <#"+foundthread.id+"> writeup was once started but never finished 😥\nI have brought it back from the archives 🗃️😎");
						await foundthread.send("**<@"+interaction.user.id+"> is back for another round!**🥊\n💨 I dusted this old writeup 📑📂 off and brought it back from the archives 🗃️🗃️🗃️\nAre you here to finally solve it and bring home those flags 🚩🚩 ⁉️")
					} else {
						// Active (Propperly)
						if (foundthread.joinable) {
							if (!foundthread.joined) await foundthread.join();
						}
						await foundthread.members.add(interaction.user.id)
						interaction.reply("<@"+interaction.user.id+"> the battle is already ongoing 🥊 Added you as a collaborator on HTB <#"+foundthread.id+"> 🤓😎")
						foundthread.send("🧑‍💻🧑‍💻 Welcome to <@"+interaction.user.id+"> as a collaborator 🧑‍💻🧑‍💻\nNow let's combine our brain 🧠 power and get this beast tamed 🤓😎")
					}
				} else {
					if ( code === 404 ) {
						console.log("[HTB] New > '"+machine+"' does not exist? - Won't create a thread for it ...")
						await interaction.reply("Could not find Hack The Box Machine: "+machine);
					} else {
						console.log("[HTB] New > Creating new thread: "+newthreadname)
						const thread = await htbchan.threads.create({
							name: newthreadname,
							autoArchiveDuration: threadArchiveDureation,
							reason: 'HachTheBox Machine Writeup: '+machine,
						});
						newthread = await htbchan.threads.cache.find(x => x.name.toLowerCase() === newthreadname.toLowerCase() );
						if (newthread.joinable) {
							if (!newthread.joined) await newthread.join();
						}
						await newthread.members.add(interaction.user.id)
						if ( interaction.channel.id == announcementOrGeneralChannelID) {
							await interaction.reply("🧑‍💻🔴 **Let the hacking begin!!** 🔴🧑‍💻\n<@"+interaction.user.id+"> has just started a writeup on HTB <#"+newthread.id+">\nFor machine details: `/htb info "+machine.toLowerCase().replace('machine-','')+"`\nJoin in on the writeup: `/htb tapin "+machine.toLowerCase().replace('machine-','')+"`");
						} else {
							await interaction.reply("🧑‍💻🔴 **Let the hacking begin!!** 🔴🧑‍💻\n<@"+interaction.user.id+"> has just started a writeup on HTB <#"+newthread.id+">\nFor machine details: `/htb info "+machine.toLowerCase().replace('machine-','')+"`\nJoin in on the writeup: `/htb tapin "+machine.toLowerCase().replace('machine-','')+"`");
							await pubchan.send("🧑‍💻🔴 **Let the hacking begin!!** 🔴🧑‍💻\n<@"+interaction.user.id+"> has just started a writeup on HTB <#"+newthread.id+">\nFor machine details: `/htb info "+machine.toLowerCase().replace('machine-','')+"`\nJoin in on the writeup: `/htb tapin "+machine.toLowerCase().replace('machine-','')+"`")
						}
						let active = "???"
						if ( json.info.active === 1) active = "Yes"
						if ( json.info.active === 0) active = "No"
						if ( json.info.retired === 1) active += " (retired)"
						rating = ""
						let stars = parseInt(json.info.stars)
						for (i=0; i < stars; i++ ) {
							// ⭐ ✨
							rating = rating+"⭐"
						}
						if ( json.info.stars.indexOf(".") ) rating = rating+"✨"
						let timeofcommand = new Date();
						let releasedate = new Date( Date.parse(json.info.release) );
						const months = [
							'January',
							'February',
							'March',
							'April',
							'May',
							'June',
							'July',
							'August',
							'September',
							'October',
							'November',
							'December'
						]
						const year = releasedate.getFullYear()
						const month = releasedate.getDate()
						const day = releasedate.getDate()
						const monthName = months[releasedate.getMonth()]
						let releasedate_fancy = day+" "+monthName+" "+year
						await newthread.send({
							"content": null,
							"embeds": [
							{
								"title": "🖥️ Hack The Box - Machine: "+json.info.name,
								"description": "**OS:** "+json.info.os+" **|** **Difficulty:** "+json.info.difficultyText+" *("+json.info.difficulty+")* **|** **Rating:** "+rating,
								"url": "https://app.hackthebox.com/machines/"+json.info.name.toLowerCase(),
								"color": 14089984,
								"fields": [
								{
									"name": "🕹️ Active:",
									"value": active,
									"inline": true
								},
								{
									"name": "🎯 Points:",
									"value": json.info.points.toString(),
									"inline": true
								},
								{
									"name": "🤹 Author:",
									"value": json.info.maker.name.toString(),
									"inline": true
								},
								{
									"name": "🧯 USER pwn(s):",
									"value": json.info.user_owns_count.toString(),
									"inline": true
								},
								{
									"name": "🔥 SYSTEM pwn(s):",
									"value": json.info.root_owns_count.toString(),
									"inline": true
								},
								{
									"name": "📅 Release date:",
									"value": releasedate_fancy,
									"inline": true
								},
								{
									"name": "🩸🩸🩸 First Blood Information ! 🩸🩸🩸",
									"value": "➖"
								},
								{
									"name": "🥇 First \"USER\"",
									"value": json.info.userBlood.user.name.toString(),
									"inline": true
								},
								{
									"name": "➖",
									"value": "➖",
									"inline": true
								},
								{
									"name": "🥇 First \"SYSTEM\"",
									"value": json.info.rootBlood.user.name.toString(),
									"inline": true
								},
								{
									"name": "⏱️ After",
									"value": json.info.userBlood.blood_difference.toString(),
									"inline": true
								},
								{
									"name": "➖",
									"value": "➖",
									"inline": true
								},
								{
									"name": "⏱️ After",
									"value": json.info.rootBlood.blood_difference.toString(),
									"inline": true
								}
								],
								"footer": {
									"text": "HTB Machine writeup started by "+interaction.user.username
								},
								"timestamp": timeofcommand.toISOString(),
								"thumbnail": {
								"url": "https://www.hackthebox.com"+json.info.avatar
								}
							}
							],
							"attachments": []
						})
						setTimeout(() => {
							newthread.send("What not? Well perhaps one of the following commands is in order!\n```shell\nnmap -sC -sV -T4 -oA "+machine.toLowerCase()+"-nmap "+json.info.ip+"\n```");
						}, 4000) // Wait 4000 milliseconds (4 seconds) before sending this message...	
					}
				}
			}
		}
	},
};
