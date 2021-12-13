import iconAdvicer from "../endpoints/icon/service/icon-advicer.js" 
import transmissionAdvicer from "../endpoints/transmission/service/transmission-advicer.js" 
class WidgetAdvicer {
  widgetAddedAdvicers = []
  widgetAdvicerMap = {}
  constructor() {
    this.widgetAdvicerMap["IconWidget"] = iconAdvicer
    this.widgetAdvicerMap["TransmissionWidget"] = transmissionAdvicer 
  }

  async afterWidgetAdded(tabIndex,widgetData) {
    var advisor = this.widgetAdvicerMap[widgetData.widget]
    if(advisor){
      await advisor.afterWidgetAdded(tabIndex,widgetData)
    }
  }

  async afterWidgetUdpated(tabIndex,widgetData) {
    var advisor = this.widgetAdvicerMap[widgetData.widget]
    if(advisor){
      await advisor.afterWidgetUpdated(tabIndex,widgetData)
    }
  }
}

var widgetAdvicer = new WidgetAdvicer()
export default widgetAdvicer