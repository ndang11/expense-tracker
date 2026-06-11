/* global Chart */

document.addEventListener('DOMContentLoaded', () => {
  const categorySelect = document.getElementById('category-select')
  const descriptionInput = document.getElementById('description-input')
  const typeSelect = document.getElementById('type-select')
  const amountInput = document.getElementById('amount-input')
  const dateInput = document.getElementById('date-input')
  const addBtn = document.getElementById('add-btn')
  const expenseTableBody = document.getElementById('expense-table-body')
  const totalExpenseEl = document.getElementById('total-expense')
  const totalIncomeEl = document.getElementById('total-income')
  const totalBalanceEl = document.getElementById('total-balance')

  const filterAllBtn = document.getElementById('filter-all')
  const filterIncomeBtn = document.getElementById('filter-income')
  const filterExpenseBtn = document.getElementById('filter-expense')

  const transactions = JSON.parse(localStorage.getItem('transactions') || '[]')

  const ctx = document.getElementById('expense-chart')?.getContext('2d')
  let chart = null
  if (ctx) {
    chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: [],
        datasets: [{
          label: 'Amount',
          data: [],
          backgroundColor: []
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } }
      }
    })
  }

  updateTable()

  function updateChart () {
    if (!chart) return
    const categories = transactions.map(t => t.category)
    const amounts = transactions.map(t => t.amount)
    const colors = transactions.map(t => t.type === 'income' ? '#4cd137' : '#e84118')
    chart.data.labels = categories
    chart.data.datasets[0].data = amounts
    chart.data.datasets[0].backgroundColor = colors
    chart.update()
  }

  function saveTransactions () {
    localStorage.setItem('transactions', JSON.stringify(transactions))
  }

  function updateTable (filterType = 'all') {
    if (!expenseTableBody) return
    expenseTableBody.innerHTML = ''
    let totalExpense = 0
    let totalIncome = 0

    transactions.forEach((t, index) => {
      if (filterType !== 'all' && t.type !== filterType) return
      const tr = document.createElement('tr')
      tr.innerHTML = `
        <td data-label='Type'>${t.type}</td>
        <td data-label='Category'>${t.category}</td>
        <td data-label='Description'>${t.description}</td>
        <td data-label='Amount'>$${t.amount.toFixed(2)}</td>
        <td data-label='Date'>${t.date}</td>
        <td data-label='Delete'><button onclick='deleteTransaction(${index})'>Delete</button></td>
      `
      expenseTableBody.appendChild(tr)

      const typeCell = tr.querySelector('td[data-label="Type"]')
      if (typeCell) {
        typeCell.style.color = t.type === 'income' ? '#4cd137' : '#e84118'
        typeCell.style.fontWeight = '600'
      }

      if (t.type === 'income') totalIncome += t.amount
      else totalExpense += t.amount
    })

    if (totalExpenseEl) totalExpenseEl.textContent = `$${totalExpense.toFixed(2)}`
    if (totalIncomeEl) totalIncomeEl.textContent = `$${totalIncome.toFixed(2)}`
    if (totalBalanceEl) totalBalanceEl.textContent = `$${(totalIncome - totalExpense).toFixed(2)}`

    updateChart()
  }

  function deleteTransaction (index) {
    transactions.splice(index, 1)
    saveTransactions()
    updateTable()
  }

  window.deleteTransaction = deleteTransaction

  addBtn?.addEventListener('click', () => {
    const category = categorySelect?.value
    const description = descriptionInput?.value
    const type = typeSelect?.value
    const amount = parseFloat(amountInput?.value)
    const date = dateInput?.value

    if (!category || !description || !amount || !date || !type) {
      alert('Please fill all fields!')
      return
    }

    if (isNaN(amount) || amount <= 0) {
      alert('Please enter a valid amount!')
      return
    }

    transactions.push({ category, description, type, amount, date })
    saveTransactions()
    updateTable()

    // Reset inputs
    if (categorySelect) categorySelect.value = ''
    if (descriptionInput) descriptionInput.value = ''
    if (amountInput) amountInput.value = ''
    if (dateInput) dateInput.value = ''
  })

  function setActiveFilter (button) {
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'))
    button.classList.add('active')
  }

  filterAllBtn?.addEventListener('click', () => {
    updateTable('all')
    setActiveFilter(filterAllBtn)
  })
  filterIncomeBtn?.addEventListener('click', () => {
    updateTable('income')
    setActiveFilter(filterIncomeBtn)
  })
  filterExpenseBtn?.addEventListener('click', () => {
    updateTable('expense')
    setActiveFilter(filterExpenseBtn)
  })

  if (dateInput && !dateInput.value) {
    const today = new Date()
    const yyyy = today.getFullYear()
    const mm = String(today.getMonth() + 1).padStart(2, '0')
    const dd = String(today.getDate()).padStart(2, '0')
    dateInput.value = `${yyyy}-${mm}-${dd}`
  }
})
