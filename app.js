
const tg = window.Telegram?.WebApp;

if (tg) {
    tg.ready();
    tg.expand();

    const user = tg.initDataUnsafe?.user;

    if (user?.first_name) {
        document.querySelector(".subtitle").textContent =
            `Привет, ${user.first_name}! Добро пожаловать`;
    }
}

document
    .getElementById("subscription-button")
    .addEventListener("click", () => {
        document.getElementById("plans").scrollIntoView({
            behavior: "smooth"
        });
    });

document.querySelectorAll("[data-plan]").forEach((button) => {
    button.addEventListener("click", () => {
        const days = Number(button.dataset.plan);

        const names = {
            30: "1 месяц",
            90: "3 месяца",
            365: "12 месяцев"
        };

        if (!names[days]) return;

        const message =
            `Выбран тариф «${names[days]}» на ${days} дней.\n\n` +
            "Это демонстрация: оплата и активация пока не подключены.";

        if (tg) {
            tg.showAlert(message);
        } else {
            alert(message);
        }
    });
});

document
    .getElementById("support-button")
    .addEventListener("click", () => {
        const message = "Раздел поддержки Kot_VPN пока в разработке.";

        if (tg) {
            tg.showAlert(message);
        } else {
            alert(message);
        }
    });
