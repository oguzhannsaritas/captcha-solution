const { exec } = require('child_process');

async function getCaptchaSrc(page) {
    const captchaSrc = await page.evaluate(() => {
        const captchaElement = document.querySelector(
            'body > div.origin > div.special-feature.special-feature.intro_bg > div > div > form > div > div:nth-child(5) > div.form-group.jvnsMt10 > img'
        );
        return captchaElement ? captchaElement.src : null;
    });
    if (!captchaSrc) {
        throw new Error('Captcha resmi bulunamadı.');
    }
    return captchaSrc;
}

async function solveCaptcha(captchaSrc) {
    return new Promise((resolve, reject) => {
        exec(`python3 /Users/oguzhan/Desktop/bot/example.py "${captchaSrc}"`, (error, stdout, stderr) => {
            if (error) {
                reject(`Node.js Hata: ${error.message}`);
                return;
            }
            if (stderr) {
                reject(`Python stderr: ${stderr}`);
                return;
            }
            resolve(stdout.trim());
        });
    });
}

async function enterCaptchaSolution(page, captchaResult) {
    const inputSelector = '#mailConfirmCodeControl';
    await page.waitForSelector(inputSelector, { timeout: 10000 });
    await page.type(inputSelector, captchaResult, { delay: 100 });
    console.log(`Captcha sonucu "${captchaResult}" ilgili alana yazıldı.`);
}

// Tüm Captcha işlemlerini tek fonksiyon altında topluyoruz
async function processCaptcha(page) {
    try {
        const captchaSrc = await getCaptchaSrc(page);
        console.log('Captcha src bulundu:', captchaSrc);

        const captchaResult = await solveCaptcha(captchaSrc);
        console.log('Captcha çözümü:', captchaResult);

        await enterCaptchaSolution(page, captchaResult);
        console.log('Captcha işlemi tamamlandı.');
    } catch (error) {
        console.error('Captcha işlemi sırasında hata oluştu:', error);
    }
}

module.exports = {
    getCaptchaSrc,
    solveCaptcha,
    enterCaptchaSolution,
    processCaptcha, // Yeni eklenen fonksiyon
};
