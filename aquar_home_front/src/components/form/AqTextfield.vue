<template>
  <div class="aq-textfield mdc-text-field mdc-text-field--outlined " style="width: 100%">
    <div class="mdc-notched-outline">
      <span class="mdc-notched-outline__leading" ></span>
      <div class="mdc-notched-outline__notch">
        <label :for="label" class="mdc-floating-label">{{label}}</label>
      </div>
      <span class="mdc-notched-outline__trailing"></span>
    </div>
    <input type="text" id="firstname" class="mdc-text-field__input" :value='value' @input='inputValue'>
  </div>
</template>
<script>
export default {
  name: 'AqTextfield',
  props: {
    label: { type: String, default: "" },
    value: { type: [String, Number], default: null}
  },
  components: {
  },
  data: function() {
    return {
      showBatch: false,
    }
  },
  computed: {
  },
  created: function() {
  },
  mounted: function() {
  },
  beforeDestroy() {
  },
  methods: {
    inputValue(event) {
      this.$emit('input',event.target.value);
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
