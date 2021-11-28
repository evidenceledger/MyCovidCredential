import { html, render } from 'lit-html';
//import { gotoPage } from "../router";
var gotoPage = window.gotoPage

import { AbstractPage } from './abstractpage'
var vaccinationQR = "HC1:NCFOXN%TSMAHN-HPO45JVLFDISVM85:D4*OV-36QHN-TM5*KQM3*GML0FXIKMWDWYPWHH:ZH6I1$4JN:IN1MPK9V L9L69UEG%6M415BEC4633F-96SW6SJE3ZMXDMUF6NZ6E6AH+932Q6G39ZILAPZXI$MI1VCSWC%PDMOL7AD.XIIXB0 J5QB06JOMI/LKW1JVTIM7JZIJI7JIZI.EJJ14B2MZ8DC8CWVD 8D*NI+PB/VSQOL9DLKWCZ3E7KDW0KZ J$XI4OIMEDTJCJKDLEDL9CZTAKBI/8D:8DKTDL+SQ05.$S6ZCJKBPKJDG3LWTXD3/9TL4T.B9GYP8T1+1V$LA*ZEBH1T+UZ%HQK9CZPME1.*UWKU/.1ZY9 UPG706ZRB KYZQBK9-RUUBCFRMLNKNM8JI0JPGO7HWPAG2B5VL3K9OTJ0UL4ZVBWSA81TXH4YVZ38+APZGJKDJB1PGB49WE*7CY2P3LM DOLQ9KKAX15BP3:GNSFKPOQU-0DCOTCPHXOP40SF355"

var recoveryQR = "HC1:NCFOXN%TSMAHN-HKTGX94G-ICWEXWPDDH9M9ESIARGHXK7V4A:C5B9VUFJMP5VC9:BPCNUKMOFE1JAA/CFZJDIKLEM1FC$50B464*632NPK98.031A E9PF6846A$Q 76UW6B699B5RFUOV1TU1BPISNHHJECNN+-CZJJ+.K4IJZJJBY4.Z8YLV0C58G13HHEGJDFH5B9-NT0 2Q58DV5 R1JMI:TURBG5Q14UVMRVUVI/E2$4JY/K+.S+2T%:KW/S8JVR+3$BJ.+I92K70ULOJ1ALJYJAZI-3C ZJ83B7N2*EU:H3N6E N3$9T5-IZ0K%PIUY25HTS SR633WSNYJF0JEYI1DLZZL162IHQAQU*0FGANYCVXMMVY6G%LSVEZ%NVBC1.M+.9Q6V.C6ZH4:KVUE87G77AS BPE/7+WL-TS+ESEWSUZD2XCDJV7KLQ39X%O7DQT-AHB0JNEZRE"

var testQR = "HC1:NCFOXN%TSMAHN-HKTGX94G-ICWEXWP769FLT3XH74M6R5ZEH%/1.TMBX43Q1B0E/GPWBILC9FF9WNHR-S7D1PI0BARKN4412IP149D%QKS1J WJP*Q.XIQXB8UJ06JSVBDKBDJJKCILML%ZJJ7J/NIKMINYJ3A41VCSWC%PDB2M67D$JCYJC66CVV8VZ0958AHLAA3S3NZ*U0I1-I0*OC6H0/VM8OI6S99K6QJ2BMAOCIPLIO4KRK4WPE-L95*BG+SB.V4Q56EK+:LJDQIYO*%NH$RSC9LHFEF89LN3%85G1U-K037Y0B /KE$CM%IG4TK47B+2Q$SQ0531T7$S5RVCNNIQV$IVYWVX:88AL**IVRFNK7XKRZK72RVV+0V7J$%25I3KC3X83$87089PRLOC8EJB6QJW V-W1OK2H:I8JVAS2V.R4ONB49ZWKTYU1:T-$CW4VPQ4P2CS1O$H891VJ:E41E0WMJ*0STQGID+BMF*V4.OF+1:TFT5G"


export class DemoPage extends AbstractPage {

    constructor(id) {
        console.log("DEMO: inside constructor")
        super(id)
    }

    enter() {
        console.log("DEMO: enter page")

        let theHtml = html`
        <!-- =========================================== -->
        <!-- HOME PAGE for demos. It has several roles   -->
        <!-- and the user can choose                     -->
        <!-- =========================================== -->
        
        <div class="container">
            <a @click=${() => gotoPage("passenger")}>
                <div class="panel">
                    <h3>I am a Passenger</h3>
                    <p>Manage your certificates</p>
                </div>
            </a>
            
            <a @click=${() => gotoPage("verifier")}>
                <div class="panel">
                    <h3>I am a Verifier</h3>
                    <p>Check validity of a certificate</p>
                </div>
            </a>

            <a @click=${() => gotoPage("displayhcert", vaccinationQR)}>
                <div class="panel">
                    <h3>Vaccination QR</h3>
                    <p>Only for testing</p>
                </div>
            </a>

            <a @click=${() => gotoPage("displayhcert", testQR)}>
                <div class="panel">
                    <h3>Test QR</h3>
                    <p>Only for testing</p>
                </div>
            </a>
            
            <a @click=${() => gotoPage("displayhcert", recoveryQR)}>
                <div class="panel">
                    <h3>Recovery QR</h3>
                    <p>Only for testing</p>
                </div>
            </a>
            
            <a @click=${() => gotoPage("issuerHome")}>
                <div class="panel">
                    <h3>I am an Issuer</h3>
                    <p>Display available certificates</p>
                </div>
            </a>
            
            <a @click=${() => gotoPage("pubcreds")}>
                <div class="panel">
                    <h3>Public Credentials</h3>
                    <p>Query the public credentials</p>
                </div>
            </a>
            
            <a @click=${() => gotoPage("admin")}>
                <div class="panel">
                    <h3 class="card-title">Admin</h3>
                    <p>Only if you know what you are doing</p>
                </div>
            </a>
        </div>
        `

        this.render(theHtml)
    }

}

