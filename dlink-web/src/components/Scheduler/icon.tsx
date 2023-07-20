/*
 *
 *  Licensed to the Apache Software Foundation (ASF) under one or more
 *  contributor license agreements.  See the NOTICE file distributed with
 *  this work for additional information regarding copyright ownership.
 *  The ASF licenses this file to You under the Apache License, Version 2.0
 *  (the "License"); you may not use this file except in compliance with
 *  the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *
 */

import { FileOutlined } from '@ant-design/icons'
import Icon from '@ant-design/icons'
const svgSize = '14px'

export const getIcon = (type: string) => {
  switch (type) {
    case 'octopus':
      return <Icon component={OctopusSvg} />
    case 'dinky':
      return <Icon component={DinkySvg} />
    default:
      return <FileOutlined />
  }
}

export const OctopusSvg = () => (
  <svg
    t="1689816613692"
    class="icon"
    viewBox="0 0 1024 1024"
    version="1.1"
    xmlns="http://www.w3.org/2000/svg"
    p-id="3471"
    width={svgSize}
    height={svgSize}
  >
    <path
      d="M276.516571 842.934857A367.652571 367.652571 0 0 0 512 927.780571c87.588571 0 168.082286-30.537143 231.350857-81.517714 13.531429 20.809143 31.305143 38.473143 52.150857 51.858286A440.502857 440.502857 0 0 1 512 1000.886857c-110.592 0-211.748571-40.594286-289.28-107.702857a174.628571 174.628571 0 0 0 53.796571-50.249143zM512 0a130.340571 130.340571 0 0 1 36.571429 255.341714l0.036571 114.029715a182.930286 182.930286 0 0 1 144.493714 204.617142l115.748572 78.043429A130.340571 130.340571 0 0 1 1024 750.848a130.340571 130.340571 0 0 1-130.304 130.304 130.340571 130.340571 0 0 1-124.781714-167.789714l-101.449143-68.461715A182.747429 182.747429 0 0 1 512 731.428571a182.747429 182.747429 0 0 1-155.428571-86.528l-101.485715 68.461715a130.340571 130.340571 0 0 1-124.818285 167.753143A130.340571 130.340571 0 0 1 0 750.884571a130.340571 130.340571 0 0 1 215.149714-98.816l115.748572-78.043428A182.930286 182.930286 0 0 1 475.428571 369.371429V255.378286A130.340571 130.340571 0 0 1 512 0z m381.732571 693.723429a57.161143 57.161143 0 1 0 0 114.322285 57.161143 57.161143 0 0 0 0-114.322285z m-763.428571 0a57.161143 57.161143 0 1 0 0 114.322285 57.161143 57.161143 0 0 0 0-114.322285zM512 438.857143a109.714286 109.714286 0 1 0 0 219.428571 109.714286 109.714286 0 0 0 0-219.428571z m173.787429-287.085714c157.878857 67.547429 268.507429 224.292571 268.507428 406.857142 0 10.605714-0.365714 21.174857-1.097143 31.597715a173.238857 173.238857 0 0 0-72.557714-11.958857 369.225143 369.225143 0 0 0-218.331429-356.864 172.617143 172.617143 0 0 0 23.478858-69.632z m-345.380572-0.914286a172.617143 172.617143 0 0 0 23.04 69.705143 369.225143 369.225143 0 0 0-220.416 349.988571 173.275429 173.275429 0 0 0-72.704 11.702857c-0.402286-7.899429-0.621714-15.762286-0.621714-23.625143 0-183.405714 111.652571-340.772571 270.701714-407.771428zM512 73.142857a57.161143 57.161143 0 1 0 0.036571 114.322286A57.161143 57.161143 0 0 0 512 73.142857z"
      fill="#FFC53D"
      p-id="3472"
    ></path>
  </svg>
)

export const DinkySvg = () => (
  <svg
    t="1689816807518"
    class="icon"
    viewBox="0 0 1024 1024"
    version="1.1"
    xmlns="http://www.w3.org/2000/svg"
    p-id="3624"
    width={svgSize}
    height={svgSize}
  >
    <path
      d="M383.634286 109.714286l109.714285 109.714285H1024v694.857143H0V109.714286h383.634286z m-30.354286 73.142857H73.142857v658.285714h877.714286V292.571429H462.994286l-109.714286-109.714286zM585.142857 365.714286l-73.142857 365.714285h-73.142857l73.142857-365.714285h73.142857z m109.714286 36.571428l182.857143 108.068572v76.434285L694.857143 694.857143v-74.788572L815.835429 548.571429 694.857143 477.074286V402.285714zM329.142857 402.285714v74.788572L208.164571 548.571429 329.142857 620.068571V694.857143l-182.857143-108.068572v-76.434285L329.142857 402.285714z"
      fill="#0ab415"
      p-id="3625"
    ></path>
  </svg>
)
