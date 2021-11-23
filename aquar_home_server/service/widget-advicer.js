import iconAdvicer from "../endpoints/icon/service/icon-advicer.js" 
class WidgetAdvicer {
  widgetAddedAdvicers = []
  constructor() {
    this.widgetAddedAdvicers.push(iconAdvicer)
  }

  async afterWidgetAdded(tabIndex,widgetData) {
    await this.widgetAddedAdvicers[0].afterWidgetAdded(tabIndex,widgetData)
  }
}

var widgetAdvicer = new WidgetAdvicer()
export default widgetAdvicer