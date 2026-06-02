const fs = require('fs');

function fixFile(file) {
    let content = fs.readFileSync(file, 'utf8');

    // 1. Add English translations
    if (!content.includes('waitingSlot:')) {
        content = content.replace(
            /months:\s*\["JAN",\s*"FEB".*\]/g,
            `months: ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"],
        viseurDefault: "TURN THE KNOB...",
        viseurHelp: "PRESS PEDAL TO LOCK",
        hmiConnect: "Connect HMI",
        hmiConnected: "✔️ HMI CONNECTED",
        hmiFailed: "❌ CONNECTION FAILED",
        waitingSlot: "WAITING...",
        dayLabel: "Day "`
        );
    }

    // 2. Add Japanese translations
    if (!content.includes('waitingSlot: "待機中..."')) {
        content = content.replace(
            /months:\s*\["1月",\s*"2月".*\]/g,
            `months: ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"],
        viseurDefault: "ノブを回して...",
        viseurHelp: "ペダルを踏んでロック",
        hmiConnect: "HMIを接続",
        hmiConnected: "✔️ HMI 接続済み",
        hmiFailed: "❌ 接続失敗",
        waitingSlot: "待機中...",
        dayLabel: "日"`
        );
    }

    // 3. Fix HTML slot generation
    content = content.replace(
        /<span class="slot-select" id="city-name-\$\{i\}">En attente\.\.\.<\/span>/g,
        `<span class="slot-select" id="city-name-\$\{i\}">\$\{TRANSLATIONS[currentLang].waitingSlot\}<\/span>`
    );
    content = content.replace(
        /<div id="day-\$\{i\}" class="slot-day">Day 1<\/div>/g,
        `<div id="day-\$\{i\}" class="slot-day">\$\{currentLang === 'EN' ? 'Day 1' : '1日'\}<\/div>`
    );

    // 4. Update updateLanguageUI
    const extraUpdates = `
    // Viseur
    const viseurText = document.getElementById('viseur-text');
    const viseurHelp = document.querySelector('.viseur-help');
    if (viseurText && (!CITIES_DB[hoveredCityIndex] || gameState !== 'SELECT')) {
        viseurText.innerText = t.viseurDefault;
    }
    if (viseurHelp) viseurHelp.innerText = t.viseurHelp;

    // HMI button
    const btnConnectCockpit = document.getElementById('btn-connect-cockpit');
    if (btnConnectCockpit) {
        if (btnConnectCockpit.innerText.includes("CONNECTED") || btnConnectCockpit.innerText.includes("接続済み")) {
            btnConnectCockpit.innerText = t.hmiConnected;
        } else if (btnConnectCockpit.innerText.includes("FAILED") || btnConnectCockpit.innerText.includes("失敗")) {
            btnConnectCockpit.innerText = t.hmiFailed;
        } else {
            btnConnectCockpit.innerHTML = \`🕹️ \$\{t.hmiConnect\}\`;
        }
    }

    // Horizontal Ranking Slots
    for (let i = 0; i < 5; i++) {
        const slotName = document.getElementById(\`city-name-\$\{i\}\`);
        if (slotName && (slotName.innerText === 'WAITING...' || slotName.innerText === '待機中...' || slotName.innerText === 'En attente...')) {
            slotName.innerText = t.waitingSlot;
        }
        const dayEl = document.getElementById(\`day-\$\{i\}\`);
        if (dayEl) {
            if (dayEl.innerText.includes('Day ') || dayEl.innerText.includes('日')) {
                const numMatch = dayEl.innerText.match(/\\d+/);
                if (numMatch) {
                    dayEl.innerText = currentLang === 'EN' ? \`Day \$\{numMatch[0]\}\` : \`\$\{numMatch[0]\}日\`;
                }
            }
        }
    }
    `;

    // Inject into updateLanguageUI before the final closing brace.
    // updateLanguageUI ends with updateFrame(); }
    if (!content.includes('// Viseur')) {
        content = content.replace(
            /updateFrame\(\);\s*\n\s*\}/g,
            `updateFrame();\n${extraUpdates}\n}`
        );
    }

    fs.writeFileSync(file, content, 'utf8');
    console.log(`Fixed ${file}`);
}

fixFile('c:\\Users\\dlx-bus\\Documents\\3D-visualization\\main.js');
fixFile('c:\\Users\\dlx-bus\\Documents\\3D-visualization\\campus.js');
