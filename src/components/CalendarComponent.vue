<script setup>
import { ref, computed, defineEmits, onMounted } from 'vue';

const emit = defineEmits(['dateSelected']);

const today = new Date();
const currentMonth = ref(today.getMonth());
const currentYear = ref(today.getFullYear());
const selectedDate = ref(null);

const monthNames = [
    '1월', '2월', '3월', '4월', '5월', '6월',
    '7월', '8월', '9월', '10월', '11월', '12월'
];
const dayNames = ['일', '월', '화', '수', '목', '금', '토'];

// 현재 월/연도 텍스트 계산
const monthYearText = computed(() => {
    return `${currentYear.value}년 ${monthNames[currentMonth.value]}`;
});

// 달력 날짜 배열 생성
const calendarDays = computed(() => {
    const days = [];
    const firstDay = new Date(currentYear.value, currentMonth.value, 1).getDay();
    const daysInMonth = new Date(currentYear.value, currentMonth.value + 1, 0).getDate();

    // 이전 달 빈 공간 채우기
    for (let i = 0; i < firstDay; i++) {
        days.push({ number: '', isCurrentMonth: false });
    }

    // 현재 달 날짜 채우기
    for (let i = 1; i <= daysInMonth; i++) {
        const dateObj = new Date(currentYear.value, currentMonth.value, i);
        const yyyy = dateObj.getFullYear();
        const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
        const dd = String(dateObj.getDate()).padStart(2, '0');

        days.push({
            number: i,
            isCurrentMonth: true,
            dateString: `${yyyy}-${mm}-${dd}`
        });
    }

    // 다음 달 빈 공간 채우기
    while (days.length % 7 !== 0) {
        days.push({ number: '', isCurrentMonth: false });
    }

    return days;
});

const prevMonth = () => {
    if (currentMonth.value === 0) {
        currentMonth.value = 11;
        currentYear.value--;
    } else {
        currentMonth.value--;
    }
};

const nextMonth = () => {
    if (currentMonth.value === 11) {
        currentMonth.value = 0;
        currentYear.value++;
    } else {
        currentMonth.value++;
    }
};

// 날짜 선택 핸들러
const handleDayClick = (day) => {
    if (day.isCurrentMonth) {
        selectedDate.value = day.dateString;
        emit('dateSelected', day.dateString);
    }
};

// 컴포넌트가 마운트될 때 오늘 날짜를 기본값으로 선택
onMounted(() => {
    const todayYyyy = today.getFullYear();
    const todayMm = String(today.getMonth() + 1).padStart(2, '0');
    const todayDd = String(today.getDate()).padStart(2, '0');
    const todayString = `${todayYyyy}-${todayMm}-${todayDd}`;

    selectedDate.value = todayString;
    emit('dateSelected', todayString);
});
</script>

<template>
    <div class="calendar-wrapper">
        <div class="calendar-header">
            <button @click="prevMonth" class="nav-btn">&lt;</button>
            <h2 class="month-year">{{ monthYearText }}</h2>
            <button @click="nextMonth" class="nav-btn">&gt;</button>
        </div>

        <div class="calendar-grid">
            <div v-for="day in dayNames" :key="day" class="day-name">{{ day }}</div>

            <div v-for="(day, index) in calendarDays" :key="index" @click="handleDayClick(day)" :class="['calendar-day', {
                'other-month': !day.isCurrentMonth,
                'today': day.number === today.getDate() && day.isCurrentMonth && currentMonth === today.getMonth() && currentYear === today.getFullYear(),
                'selected': day.dateString === selectedDate
            }]">
                <span class="day-number">{{ day.number }}</span>
                <div class="entry-summary">
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.calendar-wrapper {
    width: 100%;
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
    background-color: #f7f7f7;
    border-radius: 12px;
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
}

.calendar-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding: 0 10px;
}

.month-year {
    font-size: 1.8em;
    color: #34495e;
    font-weight: 600;
}

.nav-btn {
    background: none;
    border: 1px solid #ccc;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    font-size: 1.2em;
    cursor: pointer;
    transition: background-color 0.2s;
}

.nav-btn:hover {
    background-color: #e0e0e0;
}

.calendar-grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 1px;
    border: 1px solid #ddd;
    border-radius: 4px;
    overflow: hidden;
}

.day-name,
.calendar-day {
    padding: 10px 5px;
    text-align: center;
    min-height: 90px;
    background-color: #fff;
    border: 1px solid #eee;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
}

.day-name {
    background-color: #f0f0f0;
    font-weight: bold;
    color: #555;
    padding: 15px 5px;
    min-height: initial;
    justify-content: center;
}

.calendar-day {
    position: relative;
    cursor: pointer;
    transition: background-color 0.1s;
}

.calendar-day:hover {
    background-color: #fafafa;
}

.day-number {
    font-weight: bold;
    color: #333;
    align-self: flex-end;
}

.other-month {
    background-color: #fcfcfc;
    color: #bbb;
}

.today {
    background-color: #e8f5ff;
    border: 1px solid #3498db;
}

.selected {
    background-color: #3498db !important;
    color: white;
}

.selected .day-number {
    color: white;
}

.entry-summary {
    font-size: 0.8em;
    width: 100%;
    margin-top: 5px;
    text-align: right;
}
</style>