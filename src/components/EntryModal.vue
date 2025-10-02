<script setup>
import { ref, defineProps, defineEmits, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import { getAccessToken, logout } from '@/stores/authStore';

const props = defineProps({
    selectedDate: {
        type: String,
        required: true
    },
});

const emit = defineEmits(['close', 'entrySaved']);
const router = useRouter();

const API_BASE_URL = 'http://localhost:8080';

const PAYMENT_METHODS = [
    { value: 'CREDIT_CARD', label: '신용카드' },
    { value: 'DEBIT_CARD', label: '체크카드' },
    { value: 'CASH', label: '현금' },
];                           // 결제 방법
const form = ref({
    id: null,
    type: 'EXPENSE',
    content: '',
    description: '',
    price: 0,
    categoryId: null,
    date: props.selectedDate,
    method: 'CREDIT_CARD',
});                          // 폼 데이터
const categories = ref([]);  // 카테고리 목록
const isSaving = ref(false); // 저장 상태

// 지출 카테고리 목록을 조회
const fetchCategories = async () => {
    try {
        const token = getAccessToken();
        if (!token) throw new Error("토큰이 없습니다.");

        const response = await axios.get(`${API_BASE_URL}/api/book/categories`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        categories.value = response.data;
    } catch (error) {
        console.error("카테고리 목록 조회 실패:", error);
        alert("카테고리 목록을 불러오는 데 실패했습니다.");

        if (error.response && error.response.status === 401) {
            logout();
            router.push({ path: '/login', query: { expired: 'true' } });
            return;
        }
    }
};

// 저장
const saveEntry = async () => {
    if (form.value.type === 'EXPENSE' && !form.value.categoryId) {
        alert("지출 항목은 카테고리를 선택해야 합니다.");
        return;
    }
    if (form.value.type === 'EXPENSE' && !form.value.method) {
        alert("지출 항목은 결제 방법을 선택해야 합니다.");
        return;
    }
    if (!form.value.content || form.value.price <= 0) {
        alert("내용과 금액은 필수 입력 항목이며, 금액은 0보다 커야 합니다.");
        return;
    }

    isSaving.value = true;
    try {
        const token = getAccessToken();
        if (!token) throw new Error("토큰이 없습니다.");

        const payload = {
            id: null,
            type: form.value.type,
            content: form.value.content,
            description: form.value.description,
            price: form.value.price,
            date: form.value.date,
            categoryId: form.value.type === 'INCOME' ? null : form.value.categoryId,
            method: form.value.type === 'INCOME' ? null : form.value.method,
        };

        const url = `${API_BASE_URL}/api/book/entries`;

        await axios.post(url, payload, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        alert('항목이 성공적으로 등록되었습니다.');
        emit('entrySaved');
    } catch (error) {
        console.error("항목 저장 실패:", error.response?.data || error);
        alert(`항목 저장에 실패했습니다: ${error.response?.data?.message || '알 수 없는 오류'}`);

        if (error.response && error.response.status === 401) {
            logout();
            router.push({ path: '/login', query: { expired: 'true' } });
            return;
        }

    } finally {
        isSaving.value = false;
    }
};

// 탭 변경 시 카테고리 및 결제 방법 선택 초기화
const changeType = (newType) => {
    form.value.type = newType;
    form.value.categoryId = null;
    if (newType === 'INCOME') {
        form.value.method = null;
    } else {
        form.value.method = 'CREDIT_CARD';
    }
};

// 모달 종료
const closeModal = () => {
    emit('close');
};

// 컴포넌트 마운트 시, 카테고리 목록 로드 + 내용 입력란 포커스
onMounted(() => {
    fetchCategories();
    document.getElementById('content-input')?.focus();
});
</script>

<template>
    <div class="modal-backdrop" @click.self="closeModal">
        <div class="modal-content">
            <div class="modal-header">
                <h3>가계부 항목 추가 ({{ form.date }})</h3>
                <button class="close-btn" @click="closeModal">&times;</button>
            </div>

            <form @submit.prevent="saveEntry" class="entry-form">

                <div class="form-group type-group">
                    <label>구분</label>
                    <div class="type-selector">
                        <button type="button"
                            :class="['type-btn', { 'selected': form.type === 'EXPENSE', 'expense': true }]"
                            @click="changeType('EXPENSE')">
                            지출
                        </button>
                        <button type="button"
                            :class="['type-btn', { 'selected': form.type === 'INCOME', 'income': true }]"
                            @click="changeType('INCOME')">
                            수입
                        </button>
                    </div>
                </div>

                <div class="form-group" v-if="form.type === 'EXPENSE'">
                    <label for="category">카테고리 <span class="required">*</span></label>
                    <select id="category" v-model="form.categoryId" required>
                        <option :value="null" disabled>카테고리 선택</option>
                        <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                            {{ cat.name }}
                        </option>
                    </select>
                </div>

                <div class="form-group" v-if="form.type === 'EXPENSE'">
                    <label for="method">결제 방법 <span class="required">*</span></label>
                    <select id="method" v-model="form.method" required>
                        <option v-for="method in PAYMENT_METHODS" :key="method.value" :value="method.value">
                            {{ method.label }}
                        </option>
                    </select>
                </div>

                <div class="form-group">
                    <label for="content-input">내용 <span class="required">*</span></label>
                    <input id="content-input" type="text" v-model="form.content" required maxlength="50" />
                </div>

                <div class="form-group">
                    <label for="description-input">세부항목</label>
                    <input id="description-input" type="text" v-model="form.description" maxlength="100" />
                </div>

                <div class="form-group">
                    <label for="price-input">금액 (원) <span class="required">*</span></label>
                    <input id="price-input" type="number" v-model.number="form.price" required min="1"
                        placeholder="0" />
                </div>

                <div class="form-actions">
                    <button type="button" @click="closeModal" class="btn secondary" :disabled="isSaving">취소</button>
                    <button type="submit" class="btn primary" :disabled="isSaving">
                        <span v-if="isSaving">등록 중...</span>
                        <span v-else>등록하기</span>
                    </button>
                </div>
            </form>
        </div>
    </div>
</template>

<style scoped>
.modal-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
}

.modal-content {
    background: white;
    padding: 25px;
    border-radius: 10px;
    width: 90%;
    max-width: 450px;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
    position: relative;
    animation: fadeIn 0.2s ease-out;
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(-10px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #eee;
    padding-bottom: 10px;
    margin-bottom: 20px;
}

.modal-header h3 {
    margin: 0;
    color: #34495e;
    font-size: 1.5em;
}

.close-btn {
    background: none;
    border: none;
    font-size: 1.8em;
    cursor: pointer;
    color: #999;
}

.close-btn:hover {
    color: #333;
}

.entry-form {
    display: flex;
    flex-direction: column;
    gap: 15px;
}

.form-group label {
    display: block;
    margin-bottom: 5px;
    font-weight: 600;
    color: #555;
    font-size: 0.95em;
    text-align: left;
}

.form-group input[type="text"],
.form-group input[type="number"],
.form-group select {
    width: 100%;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 5px;
    box-sizing: border-box;
    font-size: 1em;
    transition: border-color 0.2s;
}

.form-group input:focus,
.form-group select:focus {
    border-color: #3498db;
    outline: none;
}

.required {
    color: #e74c3c;
    font-weight: bold;
}

.type-group {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
}

.type-selector {
    display: flex;
    gap: 10px;
    width: 100%;
}

.type-btn {
    flex-grow: 1;
    padding: 12px;
    border: 2px solid #ddd;
    border-radius: 8px;
    cursor: pointer;
    font-weight: bold;
    font-size: 1em;
    background-color: #f5f5f5;
    transition: all 0.2s;
}

.type-btn:not(.selected):hover {
    background-color: #eee;
}

.type-btn.expense {
    color: #e74c3c;
    border-color: #fbcbcb;
}

.type-btn.income {
    color: #2ecc71;
    border-color: #d8f5e7;
}

.type-btn.selected {
    color: white;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.type-btn.selected.expense {
    background-color: #e74c3c;
    border-color: #e74c3c;
}

.type-btn.selected.income {
    background-color: #2ecc71;
    border-color: #2ecc71;
}

.form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 20px;
}

.btn {
    padding: 10px 20px;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 600;
    transition: background-color 0.2s;
}

.btn.primary {
    background-color: #3498db;
    color: white;
}

.btn.primary:hover {
    background-color: #2980b9;
}

.btn.secondary {
    background-color: #ccc;
    color: #333;
}

.btn.secondary:hover {
    background-color: #bbb;
}

.btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}
</style>