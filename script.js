// 全局变量
var currentDate = new Date();
var statsChart = null;
var DATA_FILE_NAME = 'in_out_data.json';
var currentUser = null;

// Supabase配置
const SUPABASE_URL = 'https://zyocrbpyheakoqpzhhip.supabase.co';
const SUPABASE_ANON_KEY = 'https://zyocrbpyheakoqpzhhip.supabase.co';

// 初始化Supabase客户端
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 初始化应用
function initApp() {
    // 检查用户是否已登录
    checkLoginStatus();
    
    // 初始化登录和注册表单
    initAuthForms();
    
    // 初始化设置
    initSettings();
}

// 检查登录状态
function checkLoginStatus() {
    const user = localStorage.getItem('currentUser');
    if (user) {
        currentUser = JSON.parse(user);
        showApp();
    } else {
        showLoginPage();
    }
}

// 显示登录页面
function showLoginPage() {
    document.getElementById('login-page').style.display = 'flex';
    document.getElementById('app').style.display = 'none';
}

// 显示应用
function showApp() {
    document.getElementById('login-page').style.display = 'none';
    document.getElementById('app').style.display = 'block';
    
    // 初始化应用功能
    initAppFeatures();
}

// 初始化应用功能
function initAppFeatures() {
    // 检查是否存在数据文件并导入
    checkForDataFile();
    
    // 初始化导航
    initNavigation();
    
    // 初始化日历
    updateCalendar();
    
    // 初始化表单
    initForms();
    
    // 初始化统计分析
    initStatistics();
    
    // 初始化投资分配
    initInvestment();
    
    // 初始化数据管理
    initDataManagement();
    
    // 初始化记录表格
    updateRecordsTable();
}

// 初始化登录和注册表单
function initAuthForms() {
    // 登录标签切换
    const loginTabs = document.querySelectorAll('.login-tab');
    for (let i = 0; i < loginTabs.length; i++) {
        addEventListener(loginTabs[i], 'click', function() {
            const tabId = this.dataset.tab;
            
            // 更新标签状态
            const allTabs = document.querySelectorAll('.login-tab');
            for (let j = 0; j < allTabs.length; j++) {
                allTabs[j].classList.remove('active');
            }
            this.classList.add('active');
            
            // 更新内容状态
            const allContents = document.querySelectorAll('.login-tab-content');
            for (let k = 0; k < allContents.length; k++) {
                allContents[k].classList.remove('active');
            }
            document.getElementById(tabId + '-tab').classList.add('active');
        });
    }
    
    // 登录表单提交
    const loginForm = document.getElementById('login-form');
    addEventListener(loginForm, 'submit', async function(e) {
        e.preventDefault();
        
        const username = document.getElementById('login-username').value;
        const password = document.getElementById('login-password').value;
        
        try {
            const success = await login(username, password);
            if (success) {
                showApp();
            } else {
                alert('登录失败：用户名或密码错误');
            }
        } catch (error) {
            alert('登录失败：' + error.message);
        }
    });
    
    // 注册表单提交
    const registerForm = document.getElementById('register-form');
    addEventListener(registerForm, 'submit', async function(e) {
        e.preventDefault();
        
        const username = document.getElementById('register-username').value;
        const password = document.getElementById('register-password').value;
        const confirmPassword = document.getElementById('register-confirm-password').value;
        
        if (password !== confirmPassword) {
            alert('注册失败：两次输入的密码不一致');
            return;
        }
        
        try {
            const success = await register(username, password);
            if (success) {
                alert('注册成功！请登录');
                // 切换到登录标签
                document.querySelectorAll('.login-tab')[0].click();
            } else {
                alert('注册失败：用户名已存在');
            }
        } catch (error) {
            alert('注册失败：' + error.message);
        }
    });
}

// 初始化设置
function initSettings() {
    // 退出登录按钮
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            addEventListener(logoutBtn, 'click', async function() {
                await logout();
                showLoginPage();
            });
        }
    
    // 设置按钮
    const settingsBtn = document.getElementById('settings-btn');
    if (settingsBtn) {
        addEventListener(settingsBtn, 'click', function() {
            document.getElementById('settings-modal').classList.add('show');
        });
    }
    
    // 关闭设置模态框
    const settingsClose = document.querySelector('#settings-modal .close');
    if (settingsClose) {
        addEventListener(settingsClose, 'click', function() {
            document.getElementById('settings-modal').classList.remove('show');
        });
    }
    
    // 点击设置模态框外部关闭
    addEventListener(window, 'click', function(e) {
        const modal = document.getElementById('settings-modal');
        if (e.target === modal) {
            modal.classList.remove('show');
        }
    });
    
    // 设置标签切换
    const settingsTabs = document.querySelectorAll('.settings-tab');
    for (let i = 0; i < settingsTabs.length; i++) {
        addEventListener(settingsTabs[i], 'click', function() {
            const tabId = this.dataset.tab;
            
            // 更新标签状态
            const allTabs = document.querySelectorAll('.settings-tab');
            for (let j = 0; j < allTabs.length; j++) {
                allTabs[j].classList.remove('active');
            }
            this.classList.add('active');
            
            // 更新内容状态
            const allContents = document.querySelectorAll('.settings-tab-content');
            for (let k = 0; k < allContents.length; k++) {
                allContents[k].classList.remove('active');
            }
            document.getElementById(tabId + '-tab').classList.add('active');
        });
    }
    
    // 修改密码表单提交
    const changePasswordForm = document.getElementById('change-password-form');
    if (changePasswordForm) {
        addEventListener(changePasswordForm, 'submit', function(e) {
            e.preventDefault();
            
            const currentPassword = document.getElementById('current-password').value;
            const newPassword = document.getElementById('new-password').value;
            const confirmNewPassword = document.getElementById('confirm-new-password').value;
            
            if (newPassword !== confirmNewPassword) {
                alert('修改失败：两次输入的新密码不一致');
                return;
            }
            
            // 注意：当前后端不支持修改密码功能
            alert('密码修改功能暂未实现');
        });
    }
    
    // 保存设置按钮
    const saveSettingsBtn = document.getElementById('save-settings-btn');
    if (saveSettingsBtn) {
        addEventListener(saveSettingsBtn, 'click', function() {
            const theme = document.getElementById('theme-select').value;
            const currency = document.getElementById('currency-select').value;
            
            saveSettings({ theme, currency });
            alert('设置保存成功！');
        });
    }
}

// 用户认证相关函数

// 注册用户
async function register(username, password) {
    try {
        // 使用Supabase进行用户注册
        const { data, error } = await supabase.auth.signUp({
            email: username, // 使用用户名作为邮箱
            password: password
        });
        
        if (error) {
            throw new Error(error.message || '注册失败');
        }
        
        return true;
    } catch (error) {
        console.error('注册错误:', error);
        throw error;
    }
}

// 登录用户
async function login(username, password) {
    try {
        // 使用Supabase进行用户登录
        const { data, error } = await supabase.auth.signInWithPassword({
            email: username, // 使用用户名作为邮箱
            password: password
        });
        
        if (error) {
            throw new Error('用户名或密码错误');
        }
        
        // 保存当前用户
        currentUser = {
            id: data.user.id,
            username: data.user.email
        };
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        
        return true;
    } catch (error) {
        console.error('登录错误:', error);
        throw error;
    }
}

// 退出登录
async function logout() {
    try {
        // 使用Supabase进行用户退出登录
        const { error } = await supabase.auth.signOut();
        if (error) {
            console.error('退出登录错误:', error);
        }
        
        localStorage.removeItem('currentUser');
        currentUser = null;
    } catch (error) {
        console.error('退出登录错误:', error);
        localStorage.removeItem('currentUser');
        currentUser = null;
    }
}

// 保存设置
function saveSettings(settings) {
    localStorage.setItem('appSettings', JSON.stringify(settings));
}

// 获取设置
function getSettings() {
    const settings = localStorage.getItem('appSettings');
    return settings ? JSON.parse(settings) : {
        theme: 'light',
        currency: 'CNY'
    };
}

// 检查是否存在数据文件并导入
function checkForDataFile() {
    // 由于浏览器安全限制，无法直接访问本地文件系统
    // 但我们可以在用户首次打开应用时提示导入数据文件
    // 或者在数据管理页面添加自动检测功能
    
    // 这里我们添加一个提示，告诉用户如何使用数据文件
    if (true) {
        setTimeout(function() {
            alert('欢迎使用收益统计软件！\n\n提示：\n1. 首次使用请直接添加收益记录\n2. 数据已存储在后端服务器，可在多设备访问\n\n祝您使用愉快！');
        }, 1000);
    }
}

// 初始化导航
function initNavigation() {
    var navButtons = document.querySelectorAll('.nav-btn');
    var sections = document.querySelectorAll('.section');
    
    // 兼容IE11的forEach
    for (var i = 0; i < navButtons.length; i++) {
        var btn = navButtons[i];
        addEventListener(btn, 'click', function() {
            var sectionId = this.dataset.section;
            
            // 更新导航按钮状态
            for (var j = 0; j < navButtons.length; j++) {
                navButtons[j].classList.remove('active');
            }
            this.classList.add('active');
            
            // 更新显示的部分
            for (var k = 0; k < sections.length; k++) {
                var section = sections[k];
                section.classList.remove('active');
                if (section.id === sectionId) {
                    section.classList.add('active');
                }
            }
            
            // 如果切换到统计分析部分，更新图表
            if (sectionId === 'statistics') {
                updateStatistics();
            }
            
            // 如果切换到投资分配部分，更新投资分配数据
            if (sectionId === 'investment') {
                updateInvestment();
            }
        });
    }
    
    // 数据管理按钮点击事件
    var dataManagementButtons = [document.getElementById('data-management-btn'), document.getElementById('data-management-btn-stats')];
    for (var i = 0; i < dataManagementButtons.length; i++) {
        if (dataManagementButtons[i]) {
            addEventListener(dataManagementButtons[i], 'click', function() {
                document.getElementById('data-management-modal').classList.add('show');
            });
        }
    }
    
    // 关闭数据管理模态框
    var dataManagementClose = document.querySelector('#data-management-modal .close');
    if (dataManagementClose) {
        addEventListener(dataManagementClose, 'click', function() {
            document.getElementById('data-management-modal').classList.remove('show');
        });
    }
    
    // 点击数据管理模态框外部关闭
    addEventListener(window, 'click', function(e) {
        var modal = document.getElementById('data-management-modal');
        if (e.target === modal) {
            modal.classList.remove('show');
        }
    });
    
    // 关闭收益记录详情模态框
    var incomeRecordsClose = document.querySelector('#income-records-modal .close');
    if (incomeRecordsClose) {
        addEventListener(incomeRecordsClose, 'click', function() {
            document.getElementById('income-records-modal').classList.remove('show');
        });
    }
    
    // 点击收益记录详情模态框外部关闭
    addEventListener(window, 'click', function(e) {
        var modal = document.getElementById('income-records-modal');
        if (e.target === modal) {
            modal.classList.remove('show');
        }
    });
}

// 兼容IE11的事件监听器
function addEventListener(element, event, handler) {
    if (element.addEventListener) {
        element.addEventListener(event, handler);
    } else if (element.attachEvent) {
        element.attachEvent('on' + event, handler);
    }
}

// 更新日历
function updateCalendar() {
    var calendarGrid = document.getElementById('calendar-grid');
    var currentMonthElement = document.getElementById('current-month');
    var monthAverageElement = document.getElementById('month-average');
    
    // 清空日历网格
    calendarGrid.innerHTML = '';
    
    // 设置当前月份显示
    var year = currentDate.getFullYear();
    var month = currentDate.getMonth();
    var monthNames = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];
    currentMonthElement.textContent = year + '年 ' + monthNames[month];
    
    // 获取当月第一天是星期几
    var firstDay = new Date(year, month, 1).getDay();
    
    // 获取当月的天数
    var daysInMonth = new Date(year, month + 1, 0).getDate();
    
    // 获取上个月的天数
    var daysInPrevMonth = new Date(year, month, 0).getDate();
    
    // 生成日历头部（星期），以星期日开头
    var weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
    for (var w = 0; w < weekdays.length; w++) {
        var day = weekdays[w];
        var dayElement = document.createElement('div');
        dayElement.classList.add('calendar-day', 'weekday');
        dayElement.textContent = day;
        dayElement.style.fontWeight = 'bold';
        dayElement.style.textAlign = 'center';
        dayElement.style.padding = '8px';
        dayElement.style.minHeight = '40px';
        dayElement.style.display = 'flex';
        dayElement.style.justifyContent = 'center';
        dayElement.style.alignItems = 'center';
        calendarGrid.appendChild(dayElement);
    }
    
    // 以星期日为一周的第一天，JavaScript中getDay()返回0-6，0是星期日
    
    // 生成上个月的日期
    for (var i = firstDay - 1; i >= 0; i--) {
        var dayElement = document.createElement('div');
        dayElement.classList.add('calendar-day', 'other-month');
        
        var dayNumber = document.createElement('div');
        dayNumber.classList.add('day-number');
        dayNumber.textContent = daysInPrevMonth - i;
        dayElement.appendChild(dayNumber);
        
        calendarGrid.appendChild(dayElement);
    }
    
    // 生成当月的日期
    var monthTotal = 0;
    var dayCount = 0;
    
    // 获取今天的日期信息
    var today = new Date();
    var todayYear = today.getFullYear();
    var todayMonth = today.getMonth();
    var todayDay = today.getDate();
    
    for (var i = 1; i <= daysInMonth; i++) {
        var dayElement = document.createElement('div');
        dayElement.classList.add('calendar-day');
        
        var dayNumber = document.createElement('div');
        dayNumber.classList.add('day-number');
        dayNumber.textContent = i;
        dayElement.appendChild(dayNumber);
        
        // 计算当天的收益
        var monthStr = (month + 1).toString().padStart(2, '0');
        var dayStr = i.toString().padStart(2, '0');
        var dateStr = year + '-' + monthStr + '-' + dayStr;
        var dayIncome = calculateDayIncome(dateStr);
        
        // 检查是否是今天
        if (year === todayYear && month === todayMonth && i === todayDay) {
            dayElement.classList.add('today');
        }
        
        if (dayIncome !== 0) {
            dayCount++;
            monthTotal += dayIncome;
            
            var dayIncomeElement = document.createElement('div');
            dayIncomeElement.classList.add('day-income');
            dayIncomeElement.textContent = '¥' + dayIncome.toFixed(2);
            dayElement.appendChild(dayIncomeElement);
            
            dayElement.classList.add('has-income');
            
            if (dayIncome > 0) {
                dayElement.classList.add('positive');
            } else {
                dayElement.classList.add('negative');
            }
        }
        
        // 点击日期时打开当天收益记录模态框
        addEventListener(dayElement, 'click', function(dateStr) {
            return function() {
                openDayRecordsModal(dateStr);
            };
        }(dateStr));
        
        calendarGrid.appendChild(dayElement);
    }
    
    // 计算月平均收益
    var monthAverage = dayCount > 0 ? monthTotal / dayCount : 0;
    monthAverageElement.textContent = '¥' + monthAverage.toFixed(2);
    
    // 更新月总收益
    var monthTotalElement = document.getElementById('month-total');
    monthTotalElement.textContent = '¥' + monthTotal.toFixed(2);
}

// 兼容旧浏览器的padStart函数
if (!String.prototype.padStart) {
    String.prototype.padStart = function(targetLength, padString) {
        targetLength = targetLength >> 0;
        padString = String(padString || ' ');
        if (this.length > targetLength) {
            return String(this);
        } else {
            targetLength = targetLength - this.length;
            if (targetLength > padString.length) {
                padString += padString.repeat(targetLength / padString.length);
            }
            return padString.slice(0, targetLength) + String(this);
        }
    };
}

// 计算某天的收益
function calculateDayIncome(dateStr) {
    var records = getIncomeRecords();
    return records.filter(function(record) {
        return record.date === dateStr;
    }).reduce(function(total, record) {
        return total + parseFloat(record.amount);
    }, 0);
}

// 初始化表单
function initForms() {
    // 设置默认日期为今天
    var today = new Date().toISOString().split('T')[0];
    document.getElementById('record-date').value = today;
    
    // 收益记录表单提交
    var incomeForm = document.getElementById('income-form');
    addEventListener(incomeForm, 'submit', async function(e) {
        e.preventDefault();
        
        var date = document.getElementById('record-date').value;
        var amount = parseFloat(document.getElementById('amount').value);
        var channel = document.getElementById('channel').value;
        var note = document.getElementById('note').value;
        
        // 创建收益记录
        var record = {
            date: date,
            amount: amount,
            channel: channel,
            note: note,
            user_id: currentUser.id
        };
        
        try {
            // 保存记录
            await saveIncomeRecord(record);
            
            // 重置表单
            incomeForm.reset();
            document.getElementById('record-date').value = today;
            
            // 关闭添加收益模态框
            document.getElementById('add-income-modal').classList.remove('show');
            
            // 更新日历
            updateCalendar();
            
            // 更新记录表格
            updateRecordsTable();
            
            alert('记录保存成功！');
        } catch (error) {
            alert('保存失败：' + error.message);
        }
    });
    
    // 编辑表单提交
    var editForm = document.getElementById('edit-form');
    addEventListener(editForm, 'submit', async function(e) {
        e.preventDefault();
        
        var id = document.getElementById('edit-id').value;
        var date = document.getElementById('edit-date').value;
        var amount = parseFloat(document.getElementById('edit-amount').value);
        var channel = document.getElementById('edit-channel').value;
        var note = document.getElementById('edit-note').value;
        
        // 更新记录
        try {
            await updateIncomeRecord(id, {
                date: date,
                amount: amount,
                channel: channel,
                note: note
            });
            
            // 关闭模态框
            document.getElementById('edit-modal').classList.remove('show');
            
            // 更新日历
            updateCalendar();
            
            // 更新记录表格
            updateRecordsTable();
            
            // 更新统计图表
            updateStatistics();
            
            alert('记录更新成功！');
        } catch (error) {
            alert('更新失败：' + error.message);
        }
    });
    
    // 关闭编辑模态框
    addEventListener(document.querySelector('#edit-modal .close'), 'click', function() {
        document.getElementById('edit-modal').classList.remove('show');
    });
    
    // 点击编辑模态框外部关闭
    addEventListener(window, 'click', function(e) {
        var modal = document.getElementById('edit-modal');
        if (e.target === modal) {
            modal.classList.remove('show');
        }
    });
    
    // 添加收益按钮点击事件
    addEventListener(document.getElementById('add-income-btn'), 'click', function() {
        // 设置默认日期为今天
        var today = new Date().toISOString().split('T')[0];
        document.getElementById('record-date').value = today;
        
        // 显示添加收益模态框
        document.getElementById('add-income-modal').classList.add('show');
    });
    
    // 关闭添加收益模态框
    addEventListener(document.querySelector('#add-income-modal .close'), 'click', function() {
        document.getElementById('add-income-modal').classList.remove('show');
    });
    
    // 点击添加收益模态框外部关闭
    addEventListener(window, 'click', function(e) {
        var modal = document.getElementById('add-income-modal');
        if (e.target === modal) {
            modal.classList.remove('show');
        }
    });
}

// 初始化统计分析
function initStatistics() {
    // 时间维度选择变化时更新图表
    addEventListener(document.getElementById('time-dimension'), 'change', updateStatistics);
    
    // 图表类型选择变化时更新图表
    addEventListener(document.getElementById('chart-type'), 'change', updateStatistics);
    
    // 初始化图表
    updateStatistics();
}

// 更新统计分析
function updateStatistics() {
    var timeDimension = document.getElementById('time-dimension').value;
    var chartType = document.getElementById('chart-type').value;
    var records = getIncomeRecords();
    
    // 准备图表数据
    var chartLabels = [];
    var chartValues = [];
    
    if (chartType === 'pie') {
        // 饼状图：按渠道统计
        var channelData = getChannelDataByTimeDimension(records, timeDimension);
        
        chartLabels = Object.keys(channelData);
        chartValues = Object.values(channelData);
    } else {
        // 柱状图/折线图：按时间维度统计
        var timeData = {};
        
        for (var i = 0; i < records.length; i++) {
            var record = records[i];
            var timeKey;
            var date = new Date(record.date);
            
            if (timeDimension === 'day') {
                // 按日统计
                timeKey = record.date;
            } else if (timeDimension === 'month') {
                var monthStr = (date.getMonth() + 1).toString().padStart(2, '0');
                timeKey = date.getFullYear() + '-' + monthStr;
            } else if (timeDimension === 'quarter') {
                var quarter = Math.floor(date.getMonth() / 3) + 1;
                timeKey = date.getFullYear() + '-Q' + quarter;
            } else if (timeDimension === 'year') {
                timeKey = date.getFullYear().toString();
            }
            
            if (!timeData[timeKey]) {
                timeData[timeKey] = 0;
            }
            timeData[timeKey] += parseFloat(record.amount);
        }
        
        // 排序时间键
        chartLabels = Object.keys(timeData).sort();
        chartValues = [];
        for (var j = 0; j < chartLabels.length; j++) {
            chartValues.push(timeData[chartLabels[j]]);
        }
    }
    
    // 无论图表类型是什么，都更新渠道占比显示
    var channelData = getChannelDataByTimeDimension(records, timeDimension);
    updateChannelPercentages(channelData);
    
    // 更新图表
    updateChart(chartType, chartLabels, chartValues);
}

// 根据时间维度获取渠道数据
function getChannelDataByTimeDimension(records, timeDimension) {
    var channelData = {};
    var currentDate = new Date();
    
    for (var i = 0; i < records.length; i++) {
        var record = records[i];
        var date = new Date(record.date);
        var shouldInclude = false;
        
        // 根据时间维度判断是否包含该记录
        if (timeDimension === 'day') {
            // 当天：只包含今天的记录
            var todayStr = currentDate.toISOString().split('T')[0];
            shouldInclude = record.date === todayStr;
        } else if (timeDimension === 'month') {
            // 当月：只包含当前月份的记录
            shouldInclude = (date.getFullYear() === currentDate.getFullYear() && 
                           date.getMonth() === currentDate.getMonth());
        } else if (timeDimension === 'quarter') {
            // 当季度：只包含当前季度的记录
            var currentQuarter = Math.floor(currentDate.getMonth() / 3) + 1;
            var recordQuarter = Math.floor(date.getMonth() / 3) + 1;
            shouldInclude = (date.getFullYear() === currentDate.getFullYear() && 
                           recordQuarter === currentQuarter);
        } else if (timeDimension === 'year') {
            // 当年：只包含当前年份的记录
            shouldInclude = (date.getFullYear() === currentDate.getFullYear());
        }
        
        if (shouldInclude) {
            if (!channelData[record.channel]) {
                channelData[record.channel] = 0;
            }
            channelData[record.channel] += parseFloat(record.amount);
        }
    }
    
    return channelData;
}

// 更新图表
function updateChart(type, labels, values) {
    var ctx = document.getElementById('stats-chart').getContext('2d');
    
    // 销毁现有图表
    if (statsChart) {
        statsChart.destroy();
    }
    
    // 计算总金额（用于饼状图占比计算）
    var total = values.reduce(function(sum, value) {
        return sum + value;
    }, 0);
    
    // 简化的图表配置，确保兼容性
    var chartConfig = {
        type: type,
        data: {
            labels: labels,
            datasets: [{
                label: '收益金额',
                data: values,
                backgroundColor: type === 'pie' ? [
                    'rgba(255, 99, 132, 0.8)',
                    'rgba(54, 162, 235, 0.8)',
                    'rgba(255, 206, 86, 0.8)',
                    'rgba(75, 192, 192, 0.8)',
                    'rgba(153, 102, 255, 0.8)',
                    'rgba(255, 159, 64, 0.8)'
                ] : 'rgba(54, 162, 235, 0.8)',
                borderColor: type === 'pie' ? [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)'
                ] : 'rgba(54, 162, 235, 1)',
                borderWidth: 1,
                // 为所有图表类型添加数据标签
                datalabels: {
                    display: true,
                    formatter: function(value) {
                        return '¥' + value.toFixed(2);
                    },
                    color: '#333',
                    font: {
                        weight: 'bold'
                    }
                }
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return '金额: ¥' + context.raw.toFixed(2);
                        }
                    }
                },
                legend: {
                    display: true,
                    position: 'top'
                },
                // 启用数据标签插件
                datalabels: {
                    display: true
                }
            },
            scales: type !== 'pie' ? {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: '金额 (¥)'
                    }
                }
            } : {}
        }
    };
    
    // 创建新图表
    statsChart = new Chart(ctx, chartConfig);
}

// 更新渠道占比显示
function updateChannelPercentages(channelData) {
    var container = document.getElementById('channel-percentages');
    container.innerHTML = '';
    
    var total = Object.values(channelData).reduce(function(sum, value) {
        return sum + value;
    }, 0);
    
    // 创建总收益显示
    var totalElement = document.createElement('div');
    totalElement.classList.add('channel-total');
    totalElement.innerHTML = `<strong>总收益: ¥${total.toFixed(2)}</strong>`;
    container.appendChild(totalElement);
    
    // 创建表格
    var table = document.createElement('table');
    table.classList.add('channel-percentage-table');
    
    // 创建表头
    var thead = document.createElement('thead');
    thead.innerHTML = `
        <tr>
            <th>渠道</th>
            <th>金额</th>
            <th>占比</th>
        </tr>
    `;
    table.appendChild(thead);
    
    // 创建表格主体
    var tbody = document.createElement('tbody');
    
    var entries = Object.entries(channelData);
    for (var i = 0; i < entries.length; i++) {
        var entry = entries[i];
        var channel = entry[0];
        var amount = entry[1];
        var percentage = total > 0 ? (amount / total * 100).toFixed(2) : 0;
        var row = document.createElement('tr');
        row.innerHTML = `
            <td>${channel}</td>
            <td>¥${amount.toFixed(2)}</td>
            <td>${percentage}%</td>
        `;
        tbody.appendChild(row);
    }
    
    table.appendChild(tbody);
    container.appendChild(table);
}

// 初始化数据管理
function initDataManagement() {
    // 数据管理标签页切换
    var dataTabs = document.querySelectorAll('.data-tab');
    for (var i = 0; i < dataTabs.length; i++) {
        var tab = dataTabs[i];
        addEventListener(tab, 'click', function() {
            var tabId = this.dataset.tab;
            
            // 更新标签页状态
            var allTabs = document.querySelectorAll('.data-tab');
            for (var j = 0; j < allTabs.length; j++) {
                allTabs[j].classList.remove('active');
            }
            this.classList.add('active');
            
            // 更新内容状态
            var allContents = document.querySelectorAll('.data-tab-content');
            for (var k = 0; k < allContents.length; k++) {
                allContents[k].classList.remove('active');
            }
            document.getElementById(tabId + '-tab').classList.add('active');
            
            // 如果切换到收益记录详情标签页，更新表格
            if (tabId === 'records') {
                updateRecordsTable();
            }
            
            // 如果切换到投资分配详情标签页，更新表格
            if (tabId === 'investment') {
                updateInvestmentTable();
            }
        });
    }
    
    // 查看方式选择变化时更新表格
    var recordsViewMode = document.getElementById('records-view-mode');
    if (recordsViewMode) {
        addEventListener(recordsViewMode, 'change', updateRecordsTable);
    }
    
    // 投资分配查看方式选择变化时更新表格
    var investmentViewMode = document.getElementById('investment-view-mode');
    if (investmentViewMode) {
        addEventListener(investmentViewMode, 'change', updateInvestmentTable);
    }
    
    // 导出CSV
    var exportCsvBtn = document.getElementById('export-csv');
    if (exportCsvBtn) {
        addEventListener(exportCsvBtn, function() {
            exportToCSV();
        });
    }
    
    // 导入数据
    var importDataBtn = document.getElementById('import-data');
    if (importDataBtn) {
        addEventListener(importDataBtn, function() {
            var input = document.createElement('input');
            input.type = 'file';
            input.accept = '.csv,application/json';
            addEventListener(input, 'change', function(e) {
                var file = e.target.files[0];
                if (file) {
                    var reader = new FileReader();
                    reader.onload = function(event) {
                        try {
                            if (file.name.endsWith('.csv')) {
                                importFromCSV(event.target.result);
                            } else if (file.name.endsWith('.json')) {
                                importFromJSON(event.target.result);
                            }
                        } catch (error) {
                            alert('导入失败：' + error.message);
                        }
                    };
                    reader.readAsText(file);
                }
            });
            input.click();
        });
    }
    
    // 备份数据
    var backupDataBtn = document.getElementById('backup-data');
    if (backupDataBtn) {
        addEventListener(backupDataBtn, function() {
            backupData();
        });
    }
    
    // 清空数据
    var clearDataBtn = document.getElementById('clear-data');
    if (clearDataBtn) {
        addEventListener(clearDataBtn, function() {
            if (confirm('确定要清空所有数据吗？此操作不可恢复！')) {
                clearAllData();
                updateCalendar();
                updateRecordsTable();
                updateInvestmentTable();
                updateStatistics();
                updateInvestment();
                alert('数据已清空！');
            }
        });
    }
}

// 更新记录表格
function updateRecordsTable() {
    var recordsBody = document.getElementById('records-body');
    if (!recordsBody) return;
    
    var records = getIncomeRecords();
    var recordsViewMode = document.getElementById('records-view-mode');
    var viewMode = recordsViewMode ? recordsViewMode.value : 'all';
    
    // 清空表格
    recordsBody.innerHTML = '';
    
    if (viewMode === 'monthly') {
        // 按月合并记录
        var monthlyRecords = {};
        
        // 按月份分组记录
        for (var i = 0; i < records.length; i++) {
            var record = records[i];
            var monthKey = record.date.substring(0, 7); // YYYY-MM
            
            if (!monthlyRecords[monthKey]) {
                monthlyRecords[monthKey] = {
                    month: monthKey,
                    amount: 0,
                    records: []
                };
            }
            
            monthlyRecords[monthKey].amount += parseFloat(record.amount);
            monthlyRecords[monthKey].records.push(record);
        }
        
        // 转换为数组并按月份倒序排序
        var monthlyRecordsArray = Object.values(monthlyRecords);
        monthlyRecordsArray.sort(function(a, b) {
            return b.month.localeCompare(a.month);
        });
        
        // 填充表格
        for (var j = 0; j < monthlyRecordsArray.length; j++) {
            var monthRecord = monthlyRecordsArray[j];
            var row = document.createElement('tr');
            var channels = [...new Set(monthRecord.records.map(r => r.channel))].join(', ');
            
            row.innerHTML = '<td>' + monthRecord.month + '</td><td>' + (monthRecord.amount >= 0 ? '+' : '') + '¥' + monthRecord.amount.toFixed(2) + '</td><td>' + channels + '</td><td>共 ' + monthRecord.records.length + ' 条记录</td><td class="record-actions"><button class="view-month" data-month="' + monthRecord.month + '">查看详情</button></td>';
            recordsBody.appendChild(row);
        }
        
        // 添加查看详情按钮事件监听器
        var viewMonthButtons = document.querySelectorAll('.view-month');
        for (var k = 0; k < viewMonthButtons.length; k++) {
            var btn = viewMonthButtons[k];
            addEventListener(btn, function() {
                var month = this.dataset.month;
                showMonthDetails(month);
            });
        }
    } else {
        // 全部记录
        // 按日期倒序排序记录
        records.sort(function(a, b) {
            return new Date(b.date) - new Date(a.date);
        });
        
        // 填充表格
        for (var i = 0; i < records.length; i++) {
            var record = records[i];
            var row = document.createElement('tr');
            row.innerHTML = '<td>' + record.date + '</td><td>' + (record.amount >= 0 ? '+' : '') + '¥' + record.amount.toFixed(2) + '</td><td>' + record.channel + '</td><td>' + (record.note || '-') + '</td><td class="record-actions"><button class="edit" data-id="' + record.id + '">编辑</button><button class="delete" data-id="' + record.id + '">删除</button></td>';
            recordsBody.appendChild(row);
        }
        
        // 添加编辑和删除事件监听器
        var editButtons = document.querySelectorAll('.edit');
        for (var j = 0; j < editButtons.length; j++) {
            var btn = editButtons[j];
            addEventListener(btn, function() {
                var id = this.dataset.id;
                openEditModal(id);
            });
        }
        
        var deleteButtons = document.querySelectorAll('.delete');
        for (var k = 0; k < deleteButtons.length; k++) {
            var btn = deleteButtons[k];
            addEventListener(btn, async function() {
                var id = this.dataset.id;
                if (confirm('确定要删除这条记录吗？')) {
                    try {
                        await deleteIncomeRecord(id);
                        updateCalendar();
                        updateRecordsTable();
                        updateStatistics();
                        alert('记录已删除！');
                    } catch (error) {
                        alert('删除失败：' + error.message);
                    }
                }
            });
        }
    }
}

// 打开编辑模态框
function openEditModal(id) {
    var record = getIncomeRecordById(id);
    if (!record) return;
    
    // 关闭其他模态框
    document.getElementById('income-records-modal').classList.remove('show');
    document.getElementById('data-management-modal').classList.remove('show');
    document.getElementById('day-records-modal').classList.remove('show');
    document.getElementById('add-income-modal').classList.remove('show');
    
    document.getElementById('edit-id').value = record.id;
    document.getElementById('edit-date').value = record.date;
    document.getElementById('edit-amount').value = record.amount;
    document.getElementById('edit-channel').value = record.channel;
    document.getElementById('edit-note').value = record.note;
    
    document.getElementById('edit-modal').classList.add('show');
}

// 数据存储相关函数

// 获取所有收益记录
async function getIncomeRecords() {
    try {
        // 使用Supabase查询收益记录
        const { data, error } = await supabase
            .from('income_records')
            .select('*')
            .eq('user_id', currentUser.id)
            .order('date', { ascending: false });
        
        if (error) {
            console.error('获取收益记录错误:', error);
            // 出错时使用localStorage作为备用
            const records = localStorage.getItem('incomeRecords');
            return records ? JSON.parse(records) : [];
        }
        
        return data || [];
    } catch (error) {
        console.error('获取收益记录错误:', error);
        // 出错时使用localStorage作为备用
        const records = localStorage.getItem('incomeRecords');
        return records ? JSON.parse(records) : [];
    }
}

// 获取所有投资分配记录
async function getInvestmentRecords() {
    try {
        // 使用Supabase查询投资分配记录
        const { data, error } = await supabase
            .from('investment_records')
            .select('*')
            .eq('user_id', currentUser.id)
            .order('date', { ascending: false });
        
        if (error) {
            console.error('获取投资分配记录错误:', error);
            // 出错时使用localStorage作为备用
            const records = localStorage.getItem('investmentRecords');
            return records ? JSON.parse(records) : [];
        }
        
        return data || [];
    } catch (error) {
        console.error('获取投资分配记录错误:', error);
        // 出错时使用localStorage作为备用
        const records = localStorage.getItem('investmentRecords');
        return records ? JSON.parse(records) : [];
    }
}

// 保存投资分配记录
async function saveInvestmentRecord(record) {
    try {
        // 使用Supabase插入投资分配记录
        const { data, error } = await supabase
            .from('investment_records')
            .insert({
                user_id: currentUser.id,
                date: record.date,
                channel: record.channel,
                amount: record.amount,
                newTotal: record.newTotal
            })
            .select();
        
        if (error) {
            console.error('保存投资分配记录错误:', error);
            // 出错时使用localStorage作为备用
            const records = await getInvestmentRecords();
            records.push(record);
            localStorage.setItem('investmentRecords', JSON.stringify(records));
        }
        
        return data[0];
    } catch (error) {
        console.error('保存投资分配记录错误:', error);
        // 出错时使用localStorage作为备用
        const records = await getInvestmentRecords();
        records.push(record);
        localStorage.setItem('investmentRecords', JSON.stringify(records));
        return record;
    }
}

// 获取当前投资分配数据
function getCurrentInvestment() {
    const data = localStorage.getItem('currentInvestment');
    return data ? JSON.parse(data) : {
        alipay: 0,
        tonghuashun: 0,
        wechat: 0
    };
}

// 保存当前投资分配数据
function saveCurrentInvestment(data) {
    localStorage.setItem('currentInvestment', JSON.stringify(data));
}

// 保存收益记录
async function saveIncomeRecord(record) {
    try {
        // 使用Supabase插入收益记录
        const { data, error } = await supabase
            .from('income_records')
            .insert({
                user_id: currentUser.id,
                date: record.date,
                amount: record.amount,
                channel: record.channel,
                note: record.note
            })
            .select();
        
        if (error) {
            console.error('保存收益记录错误:', error);
            // 出错时使用localStorage作为备用
            const records = await getIncomeRecords();
            const id = String(records.length + 1);
            const newRecord = {
                id: id,
                ...record
            };
            records.push(newRecord);
            localStorage.setItem('incomeRecords', JSON.stringify(records));
            return newRecord;
        }
        
        return data[0];
    } catch (error) {
        console.error('保存收益记录错误:', error);
        // 出错时使用localStorage作为备用
        const records = await getIncomeRecords();
        const id = String(records.length + 1);
        const newRecord = {
            id: id,
            ...record
        };
        records.push(newRecord);
        localStorage.setItem('incomeRecords', JSON.stringify(records));
        return newRecord;
    }
}

// 根据ID获取收益记录
function getIncomeRecordById(id) {
    var records = getIncomeRecords();
    return records.find(record => record.id === id);
}

// 更新收益记录
async function updateIncomeRecord(id, updatedRecord) {
    try {
        // 使用Supabase更新收益记录
        const { data, error } = await supabase
            .from('income_records')
            .update(updatedRecord)
            .eq('id', id)
            .eq('user_id', currentUser.id)
            .select();
        
        if (error) {
            console.error('更新收益记录错误:', error);
            // 出错时使用localStorage作为备用
            var records = await getIncomeRecords();
            var index = records.findIndex(record => record.id === id);
            if (index === -1) {
                throw new Error('记录不存在');
            }
            records[index] = {
                ...records[index],
                ...updatedRecord
            };
            localStorage.setItem('incomeRecords', JSON.stringify(records));
            return records[index];
        }
        
        return data[0];
    } catch (error) {
        console.error('更新收益记录错误:', error);
        throw error;
    }
}

// 删除收益记录
async function deleteIncomeRecord(id) {
    try {
        // 使用Supabase删除收益记录
        const { error } = await supabase
            .from('income_records')
            .delete()
            .eq('id', id)
            .eq('user_id', currentUser.id);
        
        if (error) {
            console.error('删除收益记录错误:', error);
            // 出错时使用localStorage作为备用
            var records = await getIncomeRecords();
            var filteredRecords = records.filter(record => record.id !== id);
            localStorage.setItem('incomeRecords', JSON.stringify(filteredRecords));
        }
        
        return { message: '记录删除成功' };
    } catch (error) {
        console.error('删除收益记录错误:', error);
        throw error;
    }
}

// 清空所有数据
function clearAllData() {
    localStorage.removeItem('incomeRecords');
    localStorage.removeItem('investmentRecords');
    localStorage.removeItem('currentInvestment');
}

// 更新投资分配表格
function updateInvestmentTable() {
    var investmentBody = document.getElementById('investment-body');
    if (!investmentBody) return;
    
    var records = getInvestmentRecords();
    var investmentViewMode = document.getElementById('investment-view-mode');
    var viewMode = investmentViewMode ? investmentViewMode.value : 'all';
    
    // 清空表格
    investmentBody.innerHTML = '';
    
    if (viewMode === 'monthly') {
        // 按月合并记录
        var monthlyRecords = {};
        
        // 按月份分组记录
        for (var i = 0; i < records.length; i++) {
            var record = records[i];
            var monthKey = record.date.substring(0, 7); // YYYY-MM
            
            if (!monthlyRecords[monthKey]) {
                monthlyRecords[monthKey] = {
                    month: monthKey,
                    records: []
                };
            }
            
            monthlyRecords[monthKey].records.push(record);
        }
        
        // 转换为数组并按月份倒序排序
        var monthlyRecordsArray = Object.values(monthlyRecords);
        monthlyRecordsArray.sort(function(a, b) {
            return b.month.localeCompare(a.month);
        });
        
        // 填充表格
        for (var j = 0; j < monthlyRecordsArray.length; j++) {
            var monthRecord = monthlyRecordsArray[j];
            var row = document.createElement('tr');
            var channels = [...new Set(monthRecord.records.map(r => r.channel))].join(', ');
            var totalAmount = monthRecord.records.reduce(function(sum, r) { return sum + r.amount; }, 0);
            
            row.innerHTML = '<td>' + monthRecord.month + '</td><td>' + channels + '</td><td>' + (totalAmount >= 0 ? '+' : '') + '¥' + totalAmount.toFixed(2) + '</td><td class="record-actions"><button class="view-month-investment" data-month="' + monthRecord.month + '">查看详情</button></td>';
            investmentBody.appendChild(row);
        }
        
        // 添加查看详情按钮事件监听器
        var viewMonthButtons = document.querySelectorAll('.view-month-investment');
        for (var k = 0; k < viewMonthButtons.length; k++) {
            var btn = viewMonthButtons[k];
            addEventListener(btn, function() {
                var month = this.dataset.month;
                showMonthInvestmentDetails(month);
            });
        }
    } else {
        // 全部记录
        // 按日期倒序排序记录
        records.sort(function(a, b) {
            return new Date(b.date) - new Date(a.date);
        });
        
        // 填充表格
        for (var i = 0; i < records.length; i++) {
            var record = records[i];
            var row = document.createElement('tr');
            row.innerHTML = '<td>' + record.date + '</td><td>' + record.channel + '</td><td>' + (record.amount >= 0 ? '+' : '') + '¥' + record.amount.toFixed(2) + '</td><td class="record-actions"><button class="delete-investment" data-id="' + record.id + '">删除</button></td>';
            investmentBody.appendChild(row);
        }
        
        // 添加删除事件监听器
        var deleteButtons = document.querySelectorAll('.delete-investment');
        for (var j = 0; j < deleteButtons.length; j++) {
            var btn = deleteButtons[j];
            addEventListener(btn, function() {
                var id = this.dataset.id;
                if (confirm('确定要删除这条投资记录吗？')) {
                    deleteInvestmentRecord(id);
                    updateInvestmentTable();
                    alert('记录已删除！');
                }
            });
        }
    }
}

// 删除投资分配记录
function deleteInvestmentRecord(id) {
    const records = getInvestmentRecords();
    const filteredRecords = records.filter(record => record.id !== id);
    localStorage.setItem('investmentRecords', JSON.stringify(filteredRecords));
}

// 替换所有数据（用于导入完整备份）
function replaceAllData(records) {
    if (Array.isArray(records)) {
        // 旧格式：只包含收益记录
        localStorage.setItem('incomeRecords', JSON.stringify(records));
    } else if (records.hasOwnProperty('incomeRecords') || records.hasOwnProperty('investmentRecords')) {
        // 新格式：包含收益记录和投资记录
        if (Array.isArray(records.incomeRecords)) {
            localStorage.setItem('incomeRecords', JSON.stringify(records.incomeRecords));
        }
        if (Array.isArray(records.investmentRecords)) {
            localStorage.setItem('investmentRecords', JSON.stringify(records.investmentRecords));
        }
    }
}

// 导出到CSV
function exportToCSV() {
    const incomeRecords = getIncomeRecords();
    const investmentRecords = getInvestmentRecords();
    
    if (incomeRecords.length === 0 && investmentRecords.length === 0) {
        alert('没有数据可导出！');
        return;
    }
    
    // CSV内容
    let csvContent = '';
    
    // 导出收益记录
    if (incomeRecords.length > 0) {
        // 收益记录CSV头部
        const incomeHeaders = ['类型', '日期', '金额', '渠道', '子渠道', '备注'];
        csvContent += incomeHeaders.join(',') + '\n';
        
        // 转换收益记录为CSV行
        const incomeRows = incomeRecords.map(record => [
            '收益',
            record.date,
            record.amount,
            record.channel,
            record.subChannel || '',
            record.note || ''
        ]);
        
        csvContent += incomeRows.map(row => row.join(',')).join('\n');
    }
    
    // 如果有投资记录，添加空行分隔
    if (incomeRecords.length > 0 && investmentRecords.length > 0) {
        csvContent += '\n';
    }
    
    // 导出投资分配记录
    if (investmentRecords.length > 0) {
        // 投资记录CSV头部
        const investmentHeaders = ['类型', '日期', '渠道', '调整金额', '调整后总额'];
        csvContent += investmentHeaders.join(',') + '\n';
        
        // 转换投资记录为CSV行
        const investmentRows = investmentRecords.map(record => [
            '投资',
            record.date,
            record.channel,
            record.amount,
            record.newTotal
        ]);
        
        csvContent += investmentRows.map(row => row.join(',')).join('\n');
    }
    
    // 创建下载链接
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `收益与投资记录_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// 从CSV导入
function importFromCSV(csvContent) {
    const lines = csvContent.split('\n');
    const incomeRecords = [];
    const investmentRecords = [];
    
    // 跳过头部
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line) {
            const parts = line.split(',');
            if (parts.length >= 3) {
                // 检查是否有类型字段
                if (parts[0] === '收益') {
                    // 收益记录
                    const [type, date, amount, channel, subChannel, note] = parts;
                    if (date && amount && channel) {
                        incomeRecords.push({
                            id: Date.now().toString() + i,
                            date,
                            amount: parseFloat(amount),
                            channel,
                            subChannel: subChannel || '',
                            note: note || ''
                        });
                    }
                } else if (parts[0] === '投资') {
                    // 投资记录
                    const [type, date, channel, amount, newTotal] = parts;
                    if (date && channel && amount) {
                        investmentRecords.push({
                            id: Date.now().toString() + i + 'inv',
                            date,
                            channel,
                            amount: parseFloat(amount),
                            newTotal: parseFloat(newTotal) || 0,
                            timestamp: Date.now()
                        });
                    }
                } else {
                    // 旧格式，默认为收益记录
                    const [date, amount, channel, note] = parts;
                    if (date && amount && channel) {
                        incomeRecords.push({
                            id: Date.now().toString() + i,
                            date,
                            amount: parseFloat(amount),
                            channel,
                            note: note || ''
                        });
                    }
                }
            }
        }
    }
    
    let importedCount = 0;
    
    // 保存导入的收益记录
    if (incomeRecords.length > 0) {
        const existingIncomeRecords = getIncomeRecords();
        const allIncomeRecords = [...existingIncomeRecords, ...incomeRecords];
        localStorage.setItem('incomeRecords', JSON.stringify(allIncomeRecords));
        importedCount += incomeRecords.length;
    }
    
    // 保存导入的投资记录
    if (investmentRecords.length > 0) {
        const existingInvestmentRecords = getInvestmentRecords();
        const allInvestmentRecords = [...existingInvestmentRecords, ...investmentRecords];
        localStorage.setItem('investmentRecords', JSON.stringify(allInvestmentRecords));
        importedCount += investmentRecords.length;
    }
    
    if (importedCount > 0) {
        updateCalendar();
        updateRecordsTable();
        updateInvestmentTable();
        updateStatistics();
        updateInvestment();
        alert(`成功导入 ${importedCount} 条记录！`);
    } else {
        alert('导入失败：没有有效的记录！');
    }
}

// 从JSON导入
function importFromJSON(jsonContent) {
    const data = JSON.parse(jsonContent);
    
    if (Array.isArray(data)) {
        // 旧格式：只包含收益记录
        // 检查是否为完整备份（包含id字段）
        const isCompleteBackup = data.length > 0 && data[0].hasOwnProperty('id');
        
        let incomeRecordsToImport;
        if (isCompleteBackup) {
            // 完整备份，直接使用
            incomeRecordsToImport = data;
        } else {
            // 为每条记录生成新ID
            incomeRecordsToImport = data.map(record => ({
                ...record,
                id: Date.now().toString() + Math.random().toString(36).substr(2, 9)
            }));
        }
        
        // 替换所有收益数据
        localStorage.setItem('incomeRecords', JSON.stringify(incomeRecordsToImport));
        
        updateCalendar();
        updateRecordsTable();
        updateStatistics();
        alert(`成功导入 ${incomeRecordsToImport.length} 条收益记录！`);
    } else if (data.hasOwnProperty('incomeRecords') || data.hasOwnProperty('investmentRecords')) {
        // 新格式：包含收益记录和投资记录
        let importedCount = 0;
        
        // 导入收益记录
        if (Array.isArray(data.incomeRecords)) {
            localStorage.setItem('incomeRecords', JSON.stringify(data.incomeRecords));
            importedCount += data.incomeRecords.length;
        }
        
        // 导入投资记录
        if (Array.isArray(data.investmentRecords)) {
            localStorage.setItem('investmentRecords', JSON.stringify(data.investmentRecords));
            importedCount += data.investmentRecords.length;
        }
        
        updateCalendar();
        updateRecordsTable();
        updateInvestmentTable();
        updateStatistics();
        updateInvestment();
        alert(`成功导入 ${importedCount} 条记录！`);
    } else {
        alert('导入失败：无效的JSON数据！');
    }
}

// 备份数据
function backupData() {
    var incomeRecords = getIncomeRecords();
    var investmentRecords = getInvestmentRecords();
    var currentInvestment = getCurrentInvestment();
    
    // 创建完整的备份数据结构
    var backupData = {
        incomeRecords: incomeRecords,
        investmentRecords: investmentRecords,
        currentInvestment: currentInvestment,
        backupDate: new Date().toISOString(),
        version: '1.0'
    };
    
    // 创建JSON备份（即使没有数据也可以导出空备份）
    var jsonContent = JSON.stringify(backupData, null, 2);
    var blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
    var url = URL.createObjectURL(blob);
    var link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', DATA_FILE_NAME);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    var totalRecords = incomeRecords.length + investmentRecords.length;
    alert('数据备份成功！共导出 ' + totalRecords + ' 条记录（收益：' + incomeRecords.length + '，投资：' + investmentRecords.length + '）。\n备份文件：' + DATA_FILE_NAME + '\n\n提示：将此文件与软件放在同一目录，即可在其他电脑上使用。');
}

// 打开当天收益记录模态框
function openDayRecordsModal(dateStr) {
    // 关闭其他模态框
    document.getElementById('income-records-modal').classList.remove('show');
    document.getElementById('data-management-modal').classList.remove('show');
    document.getElementById('edit-modal').classList.remove('show');
    document.getElementById('add-income-modal').classList.remove('show');
    
    // 设置模态框标题
    document.getElementById('day-records-title').textContent = dateStr + ' 收益记录';
    
    // 加载当天的收益记录
    loadDayRecords(dateStr);
    
    // 显示模态框
    document.getElementById('day-records-modal').classList.add('show');
    
    // 绑定添加新记录按钮事件
    document.getElementById('add-record-btn').onclick = function() {
        // 设置表单日期为当前选中的日期
        document.getElementById('record-date').value = dateStr;
        
        // 关闭当天收益记录模态框
        document.getElementById('day-records-modal').classList.remove('show');
        
        // 显示添加收益模态框
        document.getElementById('add-income-modal').classList.add('show');
    };
}

// 加载当天的收益记录
function loadDayRecords(dateStr) {
    var recordsList = document.getElementById('day-records-list');
    var dayTotalElement = document.getElementById('day-total');
    
    // 清空记录列表
    recordsList.innerHTML = '';
    
    // 获取当天的所有收益记录
    var records = getIncomeRecordsByDate(dateStr);
    
    // 计算当天总收益
    var dayTotal = records.reduce(function(total, record) {
        return total + parseFloat(record.amount);
    }, 0);
    
    // 更新当天总收益显示
    dayTotalElement.textContent = '¥' + dayTotal.toFixed(2);
    
    // 如果没有记录，显示提示信息
    if (records.length === 0) {
        recordsList.innerHTML = '<p style="text-align: center; color: #888;">当天没有收益记录</p>';
        return;
    }
    
    // 渲染每条记录
    for (var i = 0; i < records.length; i++) {
        var record = records[i];
        var recordElement = document.createElement('div');
        recordElement.classList.add('day-record-item');
        
        // 格式化金额，显示正负号
        var formattedAmount = (record.amount >= 0 ? '+' : '') + '¥' + parseFloat(record.amount).toFixed(2);
        
        recordElement.innerHTML = `
            <div class="record-amount">${formattedAmount}</div>
            <div class="record-channel">${record.channel}${record.subChannel ? ' - ' + record.subChannel : ''}</div>
            <div class="record-note">${record.note || '无备注'}</div>
            <div class="record-actions">
                <button class="edit" data-id="${record.id}">编辑</button>
                <button class="delete" data-id="${record.id}">删除</button>
            </div>
        `;
        
        recordsList.appendChild(recordElement);
    }
    
    // 绑定编辑和删除按钮事件
    bindDayRecordActions();
}

// 根据日期获取收益记录
function getIncomeRecordsByDate(dateStr) {
    var records = getIncomeRecords();
    return records.filter(function(record) {
        return record.date === dateStr;
    });
}

// 绑定当天收益记录的编辑和删除事件
function bindDayRecordActions() {
    // 编辑按钮事件
    var editButtons = document.querySelectorAll('#day-records-list .edit');
    for (var i = 0; i < editButtons.length; i++) {
        var btn = editButtons[i];
        addEventListener(btn, function() {
            var id = this.dataset.id;
            
            // 关闭当天收益记录模态框
            document.getElementById('day-records-modal').classList.remove('show');
            
            // 打开编辑模态框
            openEditModal(id);
        });
    }
    
    // 删除按钮事件
    var deleteButtons = document.querySelectorAll('#day-records-list .delete');
    for (var i = 0; i < deleteButtons.length; i++) {
        var btn = deleteButtons[i];
        addEventListener(btn, async function() {
            var id = this.dataset.id;
            
            if (confirm('确定要删除这条记录吗？')) {
                try {
                    await deleteIncomeRecord(id);
                    
                    // 重新加载当天记录
                    var dateStr = document.getElementById('day-records-title').textContent.split(' ')[0];
                    loadDayRecords(dateStr);
                    
                    // 更新日历
                    updateCalendar();
                    
                    alert('记录已删除！');
                } catch (error) {
                    alert('删除失败：' + error.message);
                }
            }
        });
    }
}

// 绑定月份导航按钮
function bindMonthNavigation() {
    addEventListener(document.getElementById('prev-month'), 'click', function() {
        currentDate.setMonth(currentDate.getMonth() - 1);
        updateCalendar();
    });
    
    addEventListener(document.getElementById('next-month'), 'click', function() {
        currentDate.setMonth(currentDate.getMonth() + 1);
        updateCalendar();
    });
    
    // 绑定今天按钮点击事件
    addEventListener(document.getElementById('today-btn'), 'click', function() {
        currentDate = new Date();
        updateCalendar();
    });
}

// 初始化当天收益记录模态框的关闭事件
function initDayRecordsModal() {
    // 关闭按钮事件
    addEventListener(document.querySelector('#day-records-modal .close'), 'click', function() {
        document.getElementById('day-records-modal').classList.remove('show');
    });
    
    // 点击模态框外部关闭
    addEventListener(window, 'click', function(e) {
        var modal = document.getElementById('day-records-modal');
        if (e.target === modal) {
            modal.classList.remove('show');
        }
    });
}

// 显示月度详情
function showMonthDetails(month) {
    var records = getIncomeRecords();
    var monthRecords = records.filter(function(record) {
        return record.date.startsWith(month);
    });
    
    // 按日期倒序排序
    monthRecords.sort(function(a, b) {
        return new Date(b.date) - new Date(a.date);
    });
    
    // 创建模态框内容
    var modalContent = document.createElement('div');
    modalContent.className = 'modal-content';
    modalContent.innerHTML = `
        <span class="close">&times;</span>
        <h3>${month} 月度详情</h3>
        <div class="monthly-details-controls">
            <div>
                <label>渠道筛选:</label>
                <select id="monthly-channel-filter">
                    <option value="all">全部渠道</option>
                </select>
            </div>
        </div>
        <div class="monthly-details-list">
            <table id="monthly-details-table">
                <thead>
                    <tr>
                        <th>日期</th>
                        <th>金额</th>
                        <th>渠道</th>
                        <th>备注</th>
                        <th>操作</th>
                    </tr>
                </thead>
                <tbody id="monthly-details-body"></tbody>
            </table>
        </div>
        <div class="monthly-details-summary">
            <p>月度总收益: <span id="monthly-total-amount">¥0.00</span></p>
            <p>记录条数: <span id="monthly-record-count">0</span></p>
        </div>
    `;
    
    // 创建模态框
    var modal = document.createElement('div');
    modal.id = 'monthly-details-modal';
    modal.className = 'modal show';
    modal.appendChild(modalContent);
    
    // 添加到文档
    document.body.appendChild(modal);
    
    // 填充表格
    var monthlyDetailsBody = document.getElementById('monthly-details-body');
    var monthlyTotalAmount = document.getElementById('monthly-total-amount');
    var monthlyRecordCount = document.getElementById('monthly-record-count');
    
    var totalAmount = 0;
    
    for (var i = 0; i < monthRecords.length; i++) {
        var record = monthRecords[i];
        var row = document.createElement('tr');
        row.innerHTML = '<td>' + record.date + '</td><td>' + (record.amount >= 0 ? '+' : '') + '¥' + record.amount.toFixed(2) + '</td><td>' + record.channel + '</td><td>' + (record.note || '-') + '</td><td class="record-actions"><button class="edit" data-id="' + record.id + '">编辑</button><button class="delete" data-id="' + record.id + '">删除</button></td>';
        monthlyDetailsBody.appendChild(row);
        totalAmount += parseFloat(record.amount);
    }
    
    // 更新汇总信息
    monthlyTotalAmount.textContent = '¥' + totalAmount.toFixed(2);
    monthlyRecordCount.textContent = monthRecords.length;
    
    // 填充渠道筛选下拉框
    var channels = [...new Set(monthRecords.map(r => r.channel))];
    var monthlyChannelFilter = document.getElementById('monthly-channel-filter');
    for (var j = 0; j < channels.length; j++) {
        var option = document.createElement('option');
        option.value = channels[j];
        option.textContent = channels[j];
        monthlyChannelFilter.appendChild(option);
    }
    
    // 渠道筛选事件
    addEventListener(monthlyChannelFilter, 'change', function() {
        var selectedChannel = this.value;
        var filteredRecords = selectedChannel === 'all' ? monthRecords : monthRecords.filter(r => r.channel === selectedChannel);
        
        // 清空表格
        monthlyDetailsBody.innerHTML = '';
        
        // 填充表格
        var filteredTotal = 0;
        for (var k = 0; k < filteredRecords.length; k++) {
            var record = filteredRecords[k];
            var row = document.createElement('tr');
            row.innerHTML = '<td>' + record.date + '</td><td>' + (record.amount >= 0 ? '+' : '') + '¥' + record.amount.toFixed(2) + '</td><td>' + record.channel + '</td><td>' + (record.note || '-') + '</td><td class="record-actions"><button class="edit" data-id="' + record.id + '">编辑</button><button class="delete" data-id="' + record.id + '">删除</button></td>';
            monthlyDetailsBody.appendChild(row);
            filteredTotal += parseFloat(record.amount);
        }
        
        // 更新汇总信息
        monthlyTotalAmount.textContent = '¥' + filteredTotal.toFixed(2);
        monthlyRecordCount.textContent = filteredRecords.length;
    });
    
    // 添加编辑和删除事件监听器
    var editButtons = modal.querySelectorAll('.edit');
    for (var m = 0; m < editButtons.length; m++) {
        var btn = editButtons[m];
        addEventListener(btn, function() {
            var id = this.dataset.id;
            openEditModal(id);
            // 关闭月度详情模态框
            modal.remove();
        });
    }
    
    var deleteButtons = modal.querySelectorAll('.delete');
    for (var n = 0; n < deleteButtons.length; n++) {
        var btn = deleteButtons[n];
        addEventListener(btn, async function() {
            var id = this.dataset.id;
            if (confirm('确定要删除这条记录吗？')) {
                try {
                    await deleteIncomeRecord(id);
                    updateCalendar();
                    updateRecordsTable();
                    updateStatistics();
                    // 关闭月度详情模态框
                    modal.remove();
                    alert('记录已删除！');
                } catch (error) {
                    alert('删除失败：' + error.message);
                }
            }
        });
    }
    
    // 关闭按钮事件
    var closeBtn = modal.querySelector('.close');
    addEventListener(closeBtn, 'click', function() {
        modal.remove();
    });
    
    // 点击模态框外部关闭
    addEventListener(modal, 'click', function(e) {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

// 投资分配图表实例
var investmentChart;

// 初始化投资分配
function initInvestment() {
    // 初始化时间维度下拉框
    var timeDimensionSelect = document.getElementById('investment-time-dimension');
    
    // 切换时间维度时重新计算数据
    addEventListener(timeDimensionSelect, 'change', updateInvestment);
    
    // 绑定调整按钮事件已移除，因为我们现在使用输入框两侧的+/-按钮
    
    // 绑定+按钮事件
    var plusButtons = document.querySelectorAll('.adjust-plus');
    for (var i = 0; i < plusButtons.length; i++) {
        var btn = plusButtons[i];
        addEventListener(btn, function() {
            var channel = this.dataset.channel;
            var amount = getInputAmount(channel);
            if (confirm('确定要增加 ' + channel + ' 投资 ' + amount.toFixed(2) + ' 元吗？')) {
                adjustInvestmentAmount(channel, amount); // 增加输入框中的金额
            }
        });
    }
    
    // 绑定-按钮事件
    var minusButtons = document.querySelectorAll('.adjust-minus');
    for (var i = 0; i < minusButtons.length; i++) {
        var btn = minusButtons[i];
        addEventListener(btn, function() {
            var channel = this.dataset.channel;
            var amount = getInputAmount(channel);
            if (confirm('确定要减少 ' + channel + ' 投资 ' + amount.toFixed(2) + ' 元吗？')) {
                adjustInvestmentAmount(channel, -amount); // 减少输入框中的金额
            }
        });
    }
    
    // 初始化时更新数据
    updateInvestment();
}

// 获取输入框中的金额值
function getInputAmount(channel) {
    var inputId;
    
    // 根据渠道获取对应的输入框ID
    switch (channel) {
        case '支付宝':
            inputId = 'alipay-input';
            break;
        case '同花顺':
            inputId = 'tonghuashun-input';
            break;
        case '公众号':
            inputId = 'wechat-input';
            break;
        default:
            return 0;
    }
    
    var input = document.getElementById(inputId);
    return input ? parseFloat(input.value) || 0 : 0;
}

// 调整投资金额
function adjustInvestmentAmount(channel, amount) {
    var inputId;
    
    // 根据渠道获取对应的输入框ID
    switch (channel) {
        case '支付宝':
            inputId = 'alipay-input';
            break;
        case '同花顺':
            inputId = 'tonghuashun-input';
            break;
        case '公众号':
            inputId = 'wechat-input';
            break;
        default:
            return;
    }
    
    var input = document.getElementById(inputId);
    if (input) {
        var currentValue = parseFloat(input.value) || 0;
        var newValue = currentValue + amount;
        
        // 确保金额不为负数
        if (newValue < 0) {
            newValue = 0;
        }
        
        input.value = newValue.toFixed(2);
        updateInvestment();
    }
}

// 更新投资分配
function updateInvestment() {
    // 获取当前投资分配数据
    var currentInvestment = getCurrentInvestment();
    
    // 更新输入框值
    document.getElementById('alipay-input').value = currentInvestment.alipay.toFixed(2);
    document.getElementById('tonghuashun-input').value = currentInvestment.tonghuashun.toFixed(2);
    document.getElementById('wechat-input').value = currentInvestment.wechat.toFixed(2);
    
    // 更新显示值
    document.getElementById('alipay-investment').textContent = '¥' + currentInvestment.alipay.toFixed(2);
    document.getElementById('tonghuashun-investment').textContent = '¥' + currentInvestment.tonghuashun.toFixed(2);
    document.getElementById('wechat-investment').textContent = '¥' + currentInvestment.wechat.toFixed(2);
    
    // 更新投资分配图表
    updateInvestmentChart();
    
    // 更新投资摘要
    updateInvestmentSummary();
}

// 更新投资分配图表
function updateInvestmentChart() {
    var ctx = document.getElementById('investment-chart').getContext('2d');
    
    // 销毁现有图表
    if (investmentChart) {
        investmentChart.destroy();
    }
    
    // 获取当前投资分配数据
    var currentInvestment = getCurrentInvestment();
    
    // 准备图表数据
    var labels = ['支付宝', '同花顺', '公众号'];
    var data = [
        currentInvestment.alipay,
        currentInvestment.tonghuashun,
        currentInvestment.wechat
    ];
    
    // 计算总投资
    var totalInvestment = data.reduce(function(sum, value) {
        return sum + value;
    }, 0);
    
    // 创建图表
    investmentChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: [
                    'rgba(255, 99, 132, 0.8)',
                    'rgba(54, 162, 235, 0.8)',
                    'rgba(255, 206, 86, 0.8)'
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            var value = context.raw;
                            var percentage = totalInvestment > 0 ? ((value / totalInvestment) * 100).toFixed(1) : '0.0';
                            return context.label + ': ¥' + value.toFixed(2) + ' (' + percentage + '%)';
                        }
                    }
                }
            }
        }
    });
}

// 更新投资摘要
function updateInvestmentSummary() {
    var summaryContainer = document.getElementById('investment-summary');
    if (!summaryContainer) return;
    
    // 获取当前投资分配数据
    var currentInvestment = getCurrentInvestment();
    
    // 计算总投资
    var totalInvestment = currentInvestment.alipay + currentInvestment.tonghuashun + currentInvestment.wechat;
    
    // 计算各渠道占比
    var alipayPercentage = totalInvestment > 0 ? ((currentInvestment.alipay / totalInvestment) * 100).toFixed(1) : '0.0';
    var tonghuashunPercentage = totalInvestment > 0 ? ((currentInvestment.tonghuashun / totalInvestment) * 100).toFixed(1) : '0.0';
    var wechatPercentage = totalInvestment > 0 ? ((currentInvestment.wechat / totalInvestment) * 100).toFixed(1) : '0.0';
    
    // 更新摘要内容
    summaryContainer.innerHTML = `
        <div class="summary-item">
            <strong>总投资:</strong> ¥${totalInvestment.toFixed(2)}
        </div>
        <div class="summary-item">
            <strong>支付宝:</strong> ¥${currentInvestment.alipay.toFixed(2)} (${alipayPercentage}%)
        </div>
        <div class="summary-item">
            <strong>同花顺:</strong> ¥${currentInvestment.tonghuashun.toFixed(2)} (${tonghuashunPercentage}%)
        </div>
        <div class="summary-item">
            <strong>公众号:</strong> ¥${currentInvestment.wechat.toFixed(2)} (${wechatPercentage}%)
        </div>
    `;
}

// 显示月度投资详情
function showMonthInvestmentDetails(month) {
    var records = getInvestmentRecords();
    var monthRecords = records.filter(function(record) {
        return record.date.startsWith(month);
    });
    
    // 按日期倒序排序
    monthRecords.sort(function(a, b) {
        return new Date(b.date) - new Date(a.date);
    });
    
    // 创建模态框内容
    var modalContent = document.createElement('div');
    modalContent.className = 'modal-content';
    modalContent.innerHTML = `
        <span class="close">&times;</span>
        <h3>${month} 投资详情</h3>
        <div class="monthly-details-list">
            <table id="monthly-investment-table">
                <thead>
                    <tr>
                        <th>日期</th>
                        <th>渠道</th>
                        <th>调整金额</th>
                        <th>调整后总额</th>
                        <th>操作</th>
                    </tr>
                </thead>
                <tbody id="monthly-investment-body"></tbody>
            </table>
        </div>
    `;
    
    // 创建模态框
    var modal = document.createElement('div');
    modal.id = 'monthly-investment-modal';
    modal.className = 'modal show';
    modal.appendChild(modalContent);
    
    // 添加到文档
    document.body.appendChild(modal);
    
    // 填充表格
    var monthlyInvestmentBody = document.getElementById('monthly-investment-body');
    
    for (var i = 0; i < monthRecords.length; i++) {
        var record = monthRecords[i];
        var row = document.createElement('tr');
        row.innerHTML = '<td>' + record.date + '</td><td>' + record.channel + '</td><td>' + (record.amount >= 0 ? '+' : '') + '¥' + record.amount.toFixed(2) + '</td><td>¥' + record.newTotal.toFixed(2) + '</td><td class="record-actions"><button class="delete" data-id="' + record.id + '">删除</button></td>';
        monthlyInvestmentBody.appendChild(row);
    }
    
    // 添加删除事件监听器
    var deleteButtons = modal.querySelectorAll('.delete');
    for (var j = 0; j < deleteButtons.length; j++) {
        var btn = deleteButtons[j];
        addEventListener(btn, function() {
            var id = this.dataset.id;
            if (confirm('确定要删除这条投资记录吗？')) {
                deleteInvestmentRecord(id);
                // 重新加载月度详情
                showMonthInvestmentDetails(month);
                alert('记录已删除！');
            }
        });
    }
    
    // 关闭按钮事件
    var closeBtn = modal.querySelector('.close');
    addEventListener(closeBtn, function() {
        modal.remove();
    });
    
    // 点击模态框外部关闭
    addEventListener(modal, 'click', function(e) {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

// 页面加载完成后初始化应用
window.onload = function() {
    initApp();
    bindMonthNavigation();
    initDayRecordsModal();
};