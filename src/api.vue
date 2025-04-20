<script setup>
// 使用 Vue 3 的 <script setup> 语法，这是 Composition API 的语法糖
import { ref, onMounted } from 'vue';
// 从 Vue 中导入 ref 函数，用于创建响应式数据

const message = ref('Hello World!');

const count = ref(0);
// 创建一个响应式变量 count，初始值为 0
// ref() 函数会将普通值包装成响应式对象

onMounted(() => {
    console.log('组件挂载完成');
});
</script>

<template>
    <!-- 模板区域，用于编写组件的 HTML 结构 -->
    <!-- 当前为空，可以在这里添加组件的 HTML 内容 -->
    <h1>{{ message }}</h1>
    <button @click="count++">点击我</button>
    <p>当前计数：{{ count }}</p>    

</template>