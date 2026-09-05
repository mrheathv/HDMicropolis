/**
 * Rich advisor notice text (title + description), lifted verbatim from the
 * classic game's string table (documentation/openlaszlo/resources/data/strings_en-US.xml,
 * notice_NN_title / notice_NN_description). Keyed by the same message number
 * the engine passes to sendMessage() -- see MessageNumber in emscripten.cpp.
 *
 * Descriptions keep their original <br/> markup; render with {@html}.
 * Not every message number has a rich entry (the plain "need more X" nags
 * don't) -- callers should fall back to engineMessages.ts's terse text.
 */
export interface NoticeText {
	title: string;
	description: string;
}

export const NOTICE_TEXT: Record<number, NoticeText> = {
	10: {
		title: 'POLLUTION ALERT!',
		description:
			'Pollution in your city has exceeded the maximum allowable amounts established by the Micropolis Pollution Agency. You are running the risk of grave ecological consequences.<br/>Either clean up your act or open a gas mask concession at city hall.'
	},
	11: {
		title: 'CRIME ALERT!',
		description:
			'Crime in your city is out of hand. Angry mobs are looting and vandalizing the central city. The president will send in the national guard soon if you cannot control the problem.'
	},
	12: {
		title: 'TRAFFIC WARNING!',
		description:
			'Traffic in this city is horrible. The city gridlock is expanding. The commuters are getting militant.<br/>Either build more roads and rails or get a bulletproof limo.'
	},
	20: { title: 'FIRE REPORTED!', description: 'A fire has been reported!' },
	21: {
		title: 'MONSTER ATTACK!',
		description:
			'A large reptilian creature has been spotted in the water. It seems to be attracted to areas of high pollution. There is a trail of destruction wherever it goes.<br/>All you can do is wait till he leaves, then rebuild from the rubble.'
	},
	22: {
		title: 'TORNADO ALERT!',
		description: "A tornado has been reported! There's nothing you can do to stop it, so you'd better prepare to clean up after the disaster!"
	},
	23: {
		title: 'EARTHQUAKE!',
		description:
			'A major earthquake has occurred! Put out the fires as quickly as possible, before they spread, then reconnect the power grid and rebuild the city.'
	},
	24: { title: 'PLANE CRASH!', description: 'A plane has crashed!' },
	25: { title: 'SHIPWRECK!', description: 'A ship has wrecked!' },
	26: { title: 'TRAIN CRASH!', description: 'A train has crashed!' },
	27: { title: 'HELICOPTER CRASH!', description: 'A helicopter has crashed!' },
	30: { title: 'FIREBOMBING REPORTED!', description: 'Firebombs are falling!!' },
	32: { title: 'EXPLOSION REPORTED!', description: 'There has been an explosion!!' },
	35: {
		title: 'TOWN',
		description: 'Congratulations, your village has grown to town status. You now have 2,000 citizens.'
	},
	36: {
		title: 'CITY',
		description: 'Your town has grown into a full sized city, with a current population of 10,000. Keep up the good work!'
	},
	37: {
		title: 'CAPITAL',
		description: 'Your city has become a capital. The current population here is 50,000. Your political future looks bright.'
	},
	38: {
		title: 'METROPOLIS',
		description:
			'Your capital city has now achieved the status of metropolis. The current population is 100,000. With your management skills, you should seriously consider running for governor.'
	},
	39: {
		title: 'MEGALOPOLIS',
		description: 'Congratulation, you have reached the highest category of urban development, the megalopolis.'
	},
	41: { title: 'HEAVY TRAFFIC!', description: 'Sky Watch One reporting heavy traffic!' },
	42: {
		title: 'FLOODING REPORTED!',
		description: "Flooding has been been reported along the water's edge!"
	},
	43: {
		title: 'NUCLEAR MELTDOWN!',
		description:
			"A nuclear meltdown has occured at your power plant. You are advised to avoid the area until the radioactive isotopes decay.<br/>Many generations will confront this problem before it goes away, so don't hold your breath."
	},
	44: { title: 'RIOTS!', description: 'The citizens are rioting in the streets!' },
	47: {
		title: "YOU'RE A WINNER!",
		description:
			'Your mayorial skill and city planning expertise have earned you the KEY TO THE CITY. Local residents will erect monuments to your glory and name their first-born children after you. Why not run for governor?'
	},
	48: {
		title: 'IMPEACHMENT NOTICE!',
		description:
			'The entire population of this city has finally had enough of your inept planning and incompetant management. An angry mob - led by your mother - has been spotted in the vicinity of city hall.<br/>You should seriously consider taking an extended vacation - NOW. (Or read the manual and try again.)'
	}
};
