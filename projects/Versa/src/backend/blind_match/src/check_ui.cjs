const { chromium } = require('playwright-core');

(async () => {
    try {
        const browser = await chromium.launch({
            executablePath: '/usr/bin/chromium',
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
            headless: true
        });
        const page = await browser.newPage();
        await page.goto('http://localhost:8080/index.html');
        
        // Wait for any potential rendering
        await page.waitForTimeout(1000);

        // Evaluate layout, colors, form elements, logo placement
        const report = await page.evaluate(() => {
            const result = {
                logo: null,
                form: null,
                body: null
            };

            // Body styles
            const bodyStyle = window.getComputedStyle(document.body);
            result.body = {
                backgroundColor: bodyStyle.backgroundColor,
                fontFamily: bodyStyle.fontFamily
            };

            // Logo
            const logo = document.querySelector('img[src="company_logo.png"]');
            if (logo) {
                const style = window.getComputedStyle(logo);
                const rect = logo.getBoundingClientRect();
                
                // Get form rect to check if it's distinct
                const form = document.querySelector('form');
                const formRect = form ? form.getBoundingClientRect() : null;
                
                let distinct = false;
                if (formRect) {
                    distinct = rect.bottom < formRect.top || rect.top > formRect.bottom || rect.right < formRect.left || rect.left > formRect.right;
                }

                result.logo = {
                    src: logo.getAttribute('src'),
                    maxWidth: style.maxWidth,
                    width: style.width,
                    display: style.display,
                    margin: style.margin,
                    textAlign: logo.parentElement ? window.getComputedStyle(logo.parentElement).textAlign : null,
                    centered: style.margin.includes('auto') || (logo.parentElement && window.getComputedStyle(logo.parentElement).textAlign === 'center') || (style.display === 'block' && style.marginLeft === style.marginRight),
                    distinctFromForm: distinct,
                    rect: { top: rect.top, bottom: rect.bottom, height: rect.height, width: rect.width }
                };
            }

            // Form
            const form = document.querySelector('form');
            if (form) {
                const style = window.getComputedStyle(form);
                result.form = {
                    backgroundColor: style.backgroundColor,
                    padding: style.padding,
                    borderRadius: style.borderRadius,
                    boxShadow: style.boxShadow,
                    inputs: []
                };

                form.querySelectorAll('input').forEach(input => {
                    const inpStyle = window.getComputedStyle(input);
                    result.form.inputs.push({
                        type: input.type,
                        name: input.name,
                        id: input.id,
                        display: inpStyle.display,
                        width: inpStyle.width,
                        padding: inpStyle.padding
                    });
                });
            }

            return result;
        });

        console.log(JSON.stringify(report, null, 2));
        await browser.close();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
})();