
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

    
"use strict";

// Kot_VPN — демо-режим.
// Это не настоящая оплата и не подключение к VPN-серверу.

const SUPPORT_URL = ""; // Например: https://t.me/your_support
const VPN_LINK = "";    // Добавишь рабочую ссылку Happ позднее

const PLANS = {
    1:  { title: "1 месяц", price: 199, days: 30 },
    3:  { title: "3 месяца", price: 499, days: 90 },
    12: { title: "12 месяцев", price: 1499, days: 365 }
};

const modal = document.getElementById("demo-modal");
const modalTitle = document.getElementById("demo-title");
const modalContent = document.getElementById("demo-content");
const toast = document.getElementById("demo-toast");

let selectedPlan = null;
let toastTimer = null;

function showToast(message) {
    if (!toast) return;

    toast.textContent = message;
    toast.classList.add("is-visible");

    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
        toast.classList.remove("is-visible");
    }, 2600);
}

function openModal(title, html) {
    if (!modal || !modalTitle || !modalContent) {
        showToast("Не найдено окно сайта. Проверь HTML.");
        return;
    }

    modalTitle.textContent = title;
    modalContent.replaceChildren();

    // Контент создаётся из фиксированных шаблонов приложения.
    const template = document.createElement("template");
    template.innerHTML = html;
    modalContent.appendChild(template.content.cloneNode(true));

    modal.hidden = false;
    document.body.style.overflow = "hidden";
}

function closeModal() {
    if (modal) modal.hidden = true;
    document.body.style.overflow = "";
}

function getDemoSubscription() {
    try {
        const raw = localStorage.getItem("kotvpn_demo_subscription");
        if (!raw) return null;

        const subscription = JSON.parse(raw);
        if (
            !subscription ||
            !PLANS[subscription.plan] ||
            !Number.isFinite(subscription.expiresAt)
        ) {
            return null;
        }

        return subscription;
    } catch {
        return null;
    }
}

function formatDate(timestamp) {
    return new Date(timestamp).toLocaleDateString("ru-RU", {
        day: "numeric",
        month: "long",
        year: "numeric"
    });
}

function showPlans(planId) {
    const plan = PLANS[planId];
    if (!plan) {
        showToast("Такого тарифа нет.");
        return;
    }

    selectedPlan = String(planId);

    openModal("Выбранный тариф", `
        <p><strong>${plan.title}</strong></p>
        <p>Стоимость тарифа: <strong>${plan.price} ₽</strong></p>
        <p class="demo-warning">
            ДЕМО-РЕЖИМ. Оплата не выполняется.
            Нажатие следующей кнопки не списывает деньги
            и не выдаёт реальный VPN-доступ.
        </p>
        <button type="button" data-action="activate-demo"
                data-plan="${planId}">
            Создать тестовую подписку
        </button>
        <button type="button" data-action="close">
            Назад
        </button>
    `);
}

function activateDemo(planId) {
    const plan = PLANS[planId];
    if (!plan) {
        showToast("Выбери тариф ещё раз.");
        return;
    }

    const subscription = {
        plan: String(planId),
        createdAt: Date.now(),
        expiresAt: Date.now() + plan.days * 24 * 60 * 60 * 1000,
        demo: true
    };

    try {
        localStorage.setItem(
            "kotvpn_demo_subscription",
            JSON.stringify(subscription)
        );
    } catch {
        showToast("Браузер не разрешил сохранить тестовую подписку.");
        return;
    }

    openModal("Тестовая подписка создана", `
        <p>Тариф: <strong>${plan.title}</strong></p>
        <p>Тестовый срок до: <strong>${formatDate(subscription.expiresAt)}</strong></p>
        <p class="demo-warning">
            Это локальная демонстрация на этом устройстве.
            Оплата не произведена. VPN-доступ не активирован.
        </p>
        <button type="button" data-action="subscription">
            Посмотреть подписку
        </button>
        <button type="button" data-action="close">
            Готово
        </button>
    `);
}

function showSubscription() {
    const subscription = getDemoSubscription();

    if (!subscription) {
        openModal("Моя подписка", `
            <p>У тебя пока нет тестовой подписки.</p>
            <p>Выбери тариф, чтобы проверить демо-функции.</p>
            <button type="button" data-action="buy" data-plan="1">
                Выбрать тариф
            </button>
            <button type="button" data-action="close">Закрыть</button>
        `);
        return;
    }

    const plan = PLANS[subscription.plan];
    const expired = subscription.expiresAt <= Date.now();

    openModal("Моя подписка", `
        <p>Тариф: <strong>${plan.title}</strong></p>
        <p>Статус: <strong>${expired ? "Тестовый срок истёк" : "Тестовая подписка"}</strong></p>
        <p>Дата окончания: <strong>${formatDate(subscription.expiresAt)}</strong></p>
        <p class="demo-warning">
            Это демонстрационные данные браузера, а не подтверждение оплаты.
            Настоящий статус подписки должен проверяться на сервере.
        </p>
        <button type="button" data-action="buy" data-plan="1">
            Выбрать другой тариф
        </button>
        <button type="button" data-action="reset-demo">
            Сбросить тестовую подписку
        </button>
        <button type="button" data-action="close">Закрыть</button>
    `);
}

function showConnection() {
    if (VPN_LINK) {
        openModal("Подключение VPN", `
            <p>Открой ссылку подключения в совместимом приложении Happ.</p>
            <p class="demo-warning">
                Проверь, что ссылка получена из доверенного источника.
            </p>
            <button type="button" data-action="open-vpn">
                Открыть ссылку подключения
            </button>
            <button type="button" data-action="close">Закрыть</button>
        `);
        return;
    }

    openModal("Подключение VPN", `
        <p>1. Установи совместимое приложение Happ из официального источника.</p>
        <p>2. Получи личную ссылку конфигурации от своего VPN-сервера.</p>
        <p>3. Открой эту ссылку в Happ и следуй подсказкам приложения.</p>
        <p class="demo-warning">
            Рабочая ссылка сервера пока не настроена.
            Эта демо-страница сама по себе VPN не подключает.
        </p>
        <button type="button" data-action="close">Понятно</button>
    `);
}

function showSupport() {
    if (!SUPPORT_URL) {
        openModal("Поддержка Kot_VPN", `
            <p>Ссылка на чат поддержки пока не настроена.</p>
            <p>Добавь адрес своего Telegram-чата в переменную SUPPORT_URL
            в начале файла app.js.</p>
            <button type="button" data-action="close">Закрыть</button>
        `);
        return;
    }

    if (!/^https:\/\/t\.me\/[A-Za-z0-9_]+\/?$/.test(SUPPORT_URL)) {
        showToast("Проверь ссылку поддержки в app.js.");
        return;
    }

    if (window.Telegram?.WebApp) {
        window.Telegram.WebApp.openTelegramLink(SUPPORT_URL);
    } else {
        window.open(SUPPORT_URL, "_blank", "noopener,noreferrer");
    }
}

function handleAction(action, element) {
    const planId = element?.dataset?.plan;

    switch (action) {
        case "buy":
            showPlans(planId);
            break;

        case "activate-demo":
            activateDemo(planId || selectedPlan);
            break;

        case "subscription":
            showSubscription();
            break;

        case "connect":
            showConnection();
            break;

        case "support":
            showSupport();
            break;

        case "close":
            closeModal();
            break;

        case "reset-demo":
            try {
                localStorage.removeItem("kotvpn_demo_subscription");
                showToast("Тестовая подписка сброшена.");
                showSubscription();
            } catch {
                showToast("Не удалось сбросить тестовые данные.");
            }
            break;

        case "open-vpn":
            if (VPN_LINK && /^https:\/\//i.test(VPN_LINK)) {
                if (window.Telegram?.WebApp) {
                    window.Telegram.WebApp.openLink(VPN_LINK);
                } else {
                    window.open(VPN_LINK, "_blank", "noopener,noreferrer");
                }
            } else {
                showToast("Ссылка VPN ещё не настроена.");
            }
            break;

        default:
            showToast("Эта кнопка пока не настроена.");
    }
}

// Один обработчик для кнопок на всей странице,
// включая кнопки, созданные внутри модального окна.
document.addEventListener("click", (event) => {
    const button = event.target.closest("[data-action]");
    if (!button) return;

    handleAction(button.dataset.action, button);
});

// Закрытие окна нажатием на затемнённый фон.
modal?.addEventListener("click", (event) => {
    if (event.target === modal) closeModal();
});

// Закрытие клавишей Escape.
document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeModal();
});

// Интеграция с Telegram Mini App.
if (window.Telegram?.WebApp) {
    const tg = window.Telegram.WebApp;
    tg.ready();
    tg.expand();

    tg.BackButton.onClick(() => {
        if (modal && !modal.hidden) {
            closeModal();
        } else {
            tg.close();
        }
    });
}
