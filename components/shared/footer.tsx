export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 py-10">
      <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-3 gap-8">
        <div>
          <h4 className="font-bold mb-3">Контакты</h4>
          <p>+375-25-751-77-10</p>
          <p>info26@gmail.com</p>
        </div>

        <div>
          <h4 className="font-bold mb-3">Адрес</h4>
          <p>г. Минск, ул. Колесникова 3</p>
        </div>

        <div>
          <h4 className="font-bold mb-3">Соцсети</h4>
          {/* TODO: добавить реальные ссылки */}
          <p>VK · Telegram · Instagram</p>
        </div>
      </div>

      <div className="text-center text-sm text-gray-500 mt-8">
        © 2023 Городская поликлиника №26
      </div>
    </footer>
  );
}
