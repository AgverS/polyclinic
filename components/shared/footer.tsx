export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 py-10">
      <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-3 gap-8">
        <div>
          <h4 className="font-bold mb-3">Контакты</h4>
          <p>+375-44-512-22-79</p>
          <p>annasychova23@yandex.ru</p>
        </div>

        <div>
          <h4 className="font-bold mb-3">Адрес</h4>
          <a
            href="https://share.google/6WZ7DCPUnSFwxkc2t"
            target="_blank"
            rel="noopener noreferrer"
            className="text-inherit no-underline hover:text-inherit"
          >
            {" "}
            г. Минск, ул. Колесникова 3
          </a>
        </div>

        <div>
          <h4 className="font-bold mb-3">Соцсети</h4>
          {/* TODO: добавить реальные ссылки */}
          <p>VK · Telegram · Instagram</p>
        </div>
      </div>

      <div className="text-center text-sm text-gray-500 mt-8">
        © 2026 Городская поликлиника №26
      </div>
    </footer>
  );
}
