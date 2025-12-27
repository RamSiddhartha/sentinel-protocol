let trafficData = [];
let trafficLabels = [];

let logs = [
  { ip: "192.168.1.10", endpoint: "/api/balance", time: Date.now() },
  { ip: "192.168.1.10", endpoint: "/api/balance", time: Date.now() },
  { ip: "192.168.1.10", endpoint: "/api/transaction", time: Date.now() },
  { ip: "10.0.0.5", endpoint: "/api/history", time: Date.now() }
];

let trafficChart;

// INIT CHART AFTER PAGE LOAD
window.onload = function () {
  const ctx = document.getElementById("trafficChart").getContext("2d");

  trafficChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: trafficLabels,
      datasets: [{
        label: "API Requests",
        data: trafficData,
        borderColor: "#4da6ff",
        backgroundColor: "rgba(77,166,255,0.15)",
        fill: true,
        tension: 0.3
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: { beginAtZero: true }
      }
    }
  });
};

// SIMULATE TRAFFIC
function generateTraffic() {
  logs.push({
    ip: "192.168.1.10",
    endpoint: "/api/balance",
    time: Date.now()
  });

  if (Math.random() > 0.7) {
    logs.push({
      ip: "8.8.8.8",
      endpoint: "/api/transaction",
      time: Date.now()
    });
  }

  if (logs.length > 40) logs.shift();
}

// RENDER TABLE + UI
function renderLogs() {
  const table = document.getElementById("logTable");

  table.innerHTML = `
    <tr>
      <th>IP</th>
      <th>Endpoint</th>
      <th>Time</th>
    </tr>
  `;

  let ipCount = {};

  logs.forEach(log => {
    ipCount[log.ip] = (ipCount[log.ip] || 0) + 1;

    const row = table.insertRow();
    row.insertCell(0).innerText = log.ip;
    row.insertCell(1).innerText = log.endpoint;
    row.insertCell(2).innerText =
      new Date(log.time).toLocaleTimeString();

    if (ipCount[log.ip] > 10) {
      row.classList.add("alert");
    }
  });

  updateStatus(ipCount);

  const abuseList = document.getElementById("abuseList");
  abuseList.innerHTML = "";

  Object.keys(ipCount).forEach(ip => {
    if (ipCount[ip] > 10) {
      const li = document.createElement("li");
      li.innerText = `${ip} → ${ipCount[ip]} requests`;
      li.style.color = "red";
      abuseList.appendChild(li);
    }
  });

  trafficLabels.push(new Date().toLocaleTimeString());
  trafficData.push(logs.length);

  if (trafficLabels.length > 10) {
    trafficLabels.shift();
    trafficData.shift();
  }

  trafficChart.update();

  const lastUpdated = document.getElementById("lastUpdated");
  if (lastUpdated) {
    lastUpdated.innerText =
      "Last updated: " + new Date().toLocaleTimeString();
  }
}

// STATUS BADGE
function updateStatus(ipCount) {
  const status = document.getElementById("status");
  const abuse = Object.values(ipCount).some(c => c > 10);

  if (abuse) {
    status.innerText = "● API ABUSE DETECTED";
    status.className = "status danger";
  } else {
    status.innerText = "● System Normal";
    status.className = "status safe";
  }
}

// RUN LOOP
setInterval(() => {
  generateTraffic();
  renderLogs();
}, 1500);
