const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,

  // 빌드 타겟 디렉토리
  outputDir: '../co-note-backend/src/main/resources/static',

  // 프록시 설정
  devServer: {
    port: 3000,
    proxy: 'http://localhost:8080'
  },
})
