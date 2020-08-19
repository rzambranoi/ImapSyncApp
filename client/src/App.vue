<template>
  <div id="app">
    <nav class="navbar navbar-expand-md navbar-dark bg-dark">
      <router-link class="navbar-brand" :to="{ name: 'Home' }">ImapSyncAPP</router-link>
      <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarSupportedContent">
        <ul class="navbar-nav ml-auto" >
          <li class="nav-item" v-if="!username">
              <router-link :to="{ name: 'Login' }"  class="text-decoration-none mr-4" style='color:white'>Login</router-link>
              <router-link 
                :to="{ name: 'SingUp' }"  class="text-decoration-none mr-4 text-white" >
                Sing Up
              </router-link>
          </li>
          <li class="nav-item dropdown" v-if="username">
            <a class="nav-link dropdown-toggle" href="#" id="navbardrop" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
              {{username}}
            </a>
            <div class="dropdown-menu dropdown-menu-right dropdown-default" aria-labelledby="navbardrop">
              <router-link class="dropdown-item" :to="{ name: 'NewImap' }" href="#" >Basic Sync</router-link>
              <span class="dropdown-item">Premium Sync</span>
              <router-link class="dropdown-item" :to="{ name: 'History' }" href="#" >History</router-link>
              <a class="dropdown-item" href="#" v-on:click="Logout">Logout</a>
            </div>
          </li>
        </ul>
      </div>
        
    </nav>
    <router-view class="container pt-3"/>
  </div>
</template>

<style>
@import url('https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap');

.dropdown-menu{
  cursor: pointer;
}

</style>

<script>
const API_URL = "http://localhost:8081/api/v1/";
export default {
  data: () => ({
    token: '',
    username: ''
  }),
  methods:{
      isLoged(){
        fetch(API_URL,{
          headers: {
            Authorization: `Bearer ${localStorage.token}`,
          },
        }).then(res => res.json())
          .then((result) => {
            if(result.user){
              this.username = result.user.username
              return true;
            }else{
              localStorage.removeItem('token');
              this.username = ''
              return false;
            }
          });
      },
      Logout(){
        localStorage.removeItem('token');
        this.username = ''
        this.token = ''
        const current_path = this.$router.history.current.path;
        
        if(current_path !== '/'){
          this.$router.push('/');
        }
          
      },
  },
  mounted () {
    if(this.isLoged()){
      this.token = localStorage.getItem("token");
    }
  },
  watch:{
    $route (to, from){
      if(this.isLoged()){
        this.token = localStorage.getItem("token");
      }
    }
  }, 
};
</script>
