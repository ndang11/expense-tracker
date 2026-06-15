/* global Chart, localStorage, alert */

document.addEventListener('DOMContentLoaded', () => {
  const categoryInput = document.getElementById('category-input')
  const descriptionInput = document.getElementById('description-input')
  const typeSelect = document.getElementById('type-select')
  const amountInput = document.getElementById('amount-input')
  const dateInput = document.getElementById('date-input')
  const addBtn = document.getElementById('add-btn')
  const expenseTableBody = document.getElementById('expense-table-body')
  const totalExpenseEl = document.getElementById('total-expense')
  const totalIncomeEl = document.getElementById('total-income')
  const totalBalanceEl = document.getElementById('total-balance')

  let currentFilter = 'all'

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

    const aggregatedData = {}
    transactions.forEach(t => {
      if (currentFilter !== 'all' && t.type !== currentFilter) return
      const key = `${t.category} (${t.type})`
      if (!aggregatedData[key]) {
        aggregatedData[key] = { amount: 0, type: t.type }
      }
      aggregatedData[key].amount += t.amount
    })

    const categories = Object.keys(aggregatedData)
    const amounts = categories.map(c => aggregatedData[c].amount)
    const colors = categories.map(c => aggregatedData[c].type === 'income' ? '#4cd137' : '#e84118')

    chart.data.labels = categories
    chart.data.datasets[0].data = amounts
    chart.data.datasets[0].backgroundColor = colors
    chart.update()
  }

  function saveTransactions () {
    localStorage.setItem('transactions', JSON.stringify(transactions))
  }

  function updateTable (filterType = currentFilter) {
    if (!expenseTableBody) return
    expenseTableBody.innerHTML = ''
    let totalExpense = 0
    let totalIncome = 0

    transactions.forEach((t, index) => {
      if (filterType !== 'all' && t.type !== filterType) return
      const tr = document.createElement('tr')

      const tdType = document.createElement('td')
      tdType.setAttribute('data-label', 'Type')
      tdType.textContent = t.type
      tdType.style.color = t.type === 'income' ? '#4cd137' : '#e84118'
      tdType.style.fontWeight = '600'

      const tdCategory = document.createElement('td')
      tdCategory.setAttribute('data-label', 'Category')
      tdCategory.textContent = t.category

      const tdDescription = document.createElement('td')
      tdDescription.setAttribute('data-label', 'Description')
      tdDescription.textContent = t.description

      const tdAmount = document.createElement('td')
      tdAmount.setAttribute('data-label', 'Amount')
      tdAmount.textContent = `$${t.amount.toFixed(2)}`

      const tdDate = document.createElement('td')
      tdDate.setAttribute('data-label', 'Date')
      tdDate.textContent = t.date

      const tdDelete = document.createElement('td')
      tdDelete.setAttribute('data-label', 'Delete')
      const deleteBtn = document.createElement('button')
      deleteBtn.textContent = 'Delete'
      deleteBtn.onclick = () => deleteTransaction(index)
      tdDelete.appendChild(deleteBtn)

      tr.appendChild(tdType)
      tr.appendChild(tdCategory)
      tr.appendChild(tdDescription)
      tr.appendChild(tdAmount)
      tr.appendChild(tdDate)
      tr.appendChild(tdDelete)

      expenseTableBody.appendChild(tr)

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
    const category = categoryInput?.value
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
    if (categoryInput) categoryInput.value = ''
    if (descriptionInput) descriptionInput.value = ''
    if (amountInput) amountInput.value = ''
    if (dateInput) dateInput.value = ''
  })

  function setActiveFilter (button) {
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'))
    button.classList.add('active')
  }

  filterAllBtn?.addEventListener('click', () => {
    currentFilter = 'all'
    updateTable('all')
    setActiveFilter(filterAllBtn)
  })
  filterIncomeBtn?.addEventListener('click', () => {
    currentFilter = 'income'
    updateTable('income')
    setActiveFilter(filterIncomeBtn)
  })
  filterExpenseBtn?.addEventListener('click', () => {
    currentFilter = 'expense'
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
