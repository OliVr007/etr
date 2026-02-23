// Run this script to create an admin user: node create-admin.js

const { PrismaClient } = require("./generated/prisma");
const { hash } = require("bcrypt");
const readline = require("readline");

const db = new PrismaClient();

const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout,
});

function question(query) {
	return new Promise((resolve) => rl.question(query, resolve));
}

async function createAdmin() {
	console.log("\n=== Admin felhasználó létrehozása ===\n");

	try {
		const username = await question("Felhasználónév (pl. admin): ");
		const password = await question("Jelszó: ");
		const firstName = await question("Keresztnév: ");
		const lastName = await question("Vezetéknév: ");
		const email = await question("Email (opcionális): ");

		if (!username || !password || !firstName || !lastName) {
			console.error("\n❌ Hiba: Minden kötelező mezőt ki kell tölteni!");
			rl.close();
			await db.$disconnect();
			return;
		}

		const existingUser = await db.users.findUnique({
			where: { username: username },
		});

		if (existingUser) {
			console.error("\n❌ Hiba: Ez a felhasználónév már létezik!");
			rl.close();
			await db.$disconnect();
			return;
		}

		console.log("\n⏳ Jelszó titkosítása...");
		const hashedPassword = await hash(password, 10);

		console.log("⏳ Admin felhasználó létrehozása...");
		const admin = await db.users.create({
			data: {
				username: username,
				password_hash: hashedPassword,
				first_name: firstName,
				last_name: lastName,
				email: email || null,
				role: "admin",
			},
		});

		console.log("\n✅ Admin felhasználó sikeresen létrehozva!");
		console.log("\n📋 Bejelentkezési adatok:");
		console.log(`   Felhasználónév: ${username}`);
		console.log(`   Jelszó: ${password}`);
		console.log(`   Szerepkör: Admin`);
		console.log("\n⚠️  FONTOS: Mentsd el ezeket az adatokat biztonságos helyre!");
		console.log("   A jelszót bejelentkezés után ajánlott megváltoztatni.\n");
	} catch (error) {
		console.error("\n❌ Hiba történt:", error.message);
	} finally {
		rl.close();
		await db.$disconnect();
	}
}

createAdmin();
