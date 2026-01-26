import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const data = await req.json();

  const html = `
<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8" />
  <title>Талон вызова врача</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      padding: 40px;
    }
    h1 {
      text-align: center;
    }
    .row {
      margin-bottom: 10px;
    }
  </style>
</head>
<body>
  <h1>Талон вызова врача</h1>

  <div class="row"><b>Пациент:</b> ${data.fullName}</div>
  <div class="row"><b>Телефон:</b> ${data.phone}</div>
  <div class="row"><b>Адрес:</b> ${data.address}</div>

  <hr />

  <div class="row"><b>Врач:</b> ${data.doctor}</div>
  <div class="row"><b>Дата:</b> ${data.date}</div>
  <div class="row"><b>Время:</b> ${data.time}</div>

  <script>
    window.onload = () => window.print();
  </script>
</body>
</html>
`;

  return new Response(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
    },
  });
}
