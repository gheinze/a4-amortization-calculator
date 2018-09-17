QUnit.test("A4 amortizaton calculator: payment amount rounds up", function(assert) {

    var amAttrs = {
        loanAmount: 10000,
        regularPayment: 0,
        startDate: '2018-01-01',
        adjustmentDate: '2018-01-01',
        termInMonths: 12,
        interestOnly: true,
        amortizationPeriodMonths: 240,
        compoundingPeriodsPerYear: 2,
        paymentFrequency: 12,
        interestRate: 10
    };

    amAttrs.interestOnly = true;
    var monthlyPayment = a4.getPeriodicPayment(amAttrs);
    assert.equal(monthlyPayment, 83.34, "Interest-only monthly payment: any fractional amount should round up (ceiling).");

    amAttrs.interestOnly = false;
    monthlyPayment = a4.getPeriodicPayment(amAttrs);
    assert.equal(monthlyPayment, 95.17, "Amortized monthly payment: any fractional amount should round up (ceiling).");

});


QUnit.test("A4 amortizaton calculator: interest only regular payment", function(assert) {

    var amAttrs = {
        loanAmount: 10000,
        interestOnly: true,
        paymentFrequency: 12,
        interestRate: 10
    };

    var expectedAnnualInterest = amAttrs.loanAmount * amAttrs.interestRate / 100;

    for (let paymentFrequency of [52, 26, 24, 12, 6, 4, 2, 1]) {
        amAttrs.paymentFrequency = paymentFrequency;
        let regularPayment = a4.getPeriodicPayment(amAttrs);
        let result = ((paymentFrequency * regularPayment) >= expectedAnnualInterest) &&
            ((paymentFrequency * (regularPayment - 1)) < expectedAnnualInterest);
        assert.ok(result, "Interest only payment for " + paymentFrequency + " times a year.");
    }

});


QUnit.test("A4 amortizaton calculator: amortized regular payment (compounding semi-anually)", function(assert) {

    var amAttrs = {
        loanAmount: 10000,
        regularPayment: 0,
        startDate: '2018-01-01',
        adjustmentDate: '2018-01-01',
        termInMonths: 12,
        interestOnly: false,
        amortizationPeriodMonths: 240,
        compoundingPeriodsPerYear: 2,
        paymentFrequency: 12,
        interestRate: 10
    };

    var frequencies = [52, 26, 24, 12, 6, 4, 2, 1];
    var expectedPayments = [21.90, 43.83, 47.49, 95.17, 191.11, 287.84, 582.79, 1194.71];

    for (let i = 0; i < frequencies.length; i++) {
        amAttrs.paymentFrequency = frequencies[i];
        var regularPayment = a4.getPeriodicPayment(amAttrs);
        assert.equal(regularPayment, expectedPayments[i], "Amortized payment for " + frequencies[i] + " times a year.");
    }

});


QUnit.test("A4 amortizaton calculator: amortized regular payment (amortization periods)", function(assert) {

    var amAttrs = {
        loanAmount: 10000,
        regularPayment: 0,
        startDate: '2018-01-01',
        adjustmentDate: '2018-01-01',
        termInMonths: 12,
        interestOnly: false,
        amortizationPeriodMonths: 240,
        compoundingPeriodsPerYear: 2,
        paymentFrequency: 12,
        interestRate: 10
    };

    var compoundingPeriodsPerYear = [12, 2, 1];
    var expectedPayments = [96.51, 95.17, 93.67];

    for (let i = 0; i < compoundingPeriodsPerYear.length; i++) {
        amAttrs.compoundingPeriodsPerYear = compoundingPeriodsPerYear[i];
        var regularPayment = a4.getPeriodicPayment(amAttrs);
        assert.equal(regularPayment, expectedPayments[i], "Amortized payment with " + compoundingPeriodsPerYear[i] + " compounding periods.");
    }

});


QUnit.test("A4 amortizaton calculator: per diem", function(assert) {

    var amAttrs = {
        loanAmount: 10000,
        interestRate: 10
    };

    var perDiem = a4.getPerDiem(amAttrs);
    var expectedPerDiem = Math.ceil(amAttrs.loanAmount * amAttrs.interestRate / 100 / 365 * 100) / 100;

    assert.equal(perDiem, expectedPerDiem, "Per Diem: interest only loan");

    amAttrs.interestOnly = false;
    perDiem = a4.getPerDiem(amAttrs);
    assert.equal(perDiem, expectedPerDiem, "Per Diem: amortized loan");


});


QUnit.test("A4 amortizaton calculator: interest only payments", function(assert) {

    var amAttrs = {
        loanAmount: 10000,
        preferredPayment: 0,
        startDate: '2018-01-10',
        adjustmentDate: '2018-01-15',
        termInMonths: 12,
        interestOnly: true,
        paymentFrequency: 12,
        interestRate: 10
    };

    var payments = a4.getPayments(amAttrs);


    assert.equal(payments.length, 13, "Payment count for monthly payments in a 1 year term");

    assert.equal(payments[0].paymentNumber, 0, "Payment number for payment 0");
    assert.equal(payments[0].interest, 13.7, "Interest payment for 5 days");
    assert.equal(payments[0].principal, 0, "Principal for payment 0");
    assert.equal(payments[0].balance, 10000, "Balance for payment 0");
    assert.equal(payments[0].date, amAttrs.adjustmentDate, "Adjustment date for payment 0");


    for (let paymentNumber = 1; paymentNumber < payments.length; paymentNumber++) {
        console.log(payments[paymentNumber].principal + " " + typeof payments[paymentNumber].principal);
        assert.equal(payments[paymentNumber].paymentNumber, paymentNumber, "Payment number for payment " + paymentNumber);
        assert.equal(payments[paymentNumber].interest, 83.34, "Interest payment for month " + paymentNumber);
        assert.equal(payments[paymentNumber].principal, 0, "Principal for payment " + paymentNumber);
        assert.equal(payments[paymentNumber].balance, 10000, "Balance for payment " + paymentNumber);

        let paymentDate = moment(payments[paymentNumber].date).format("YYYYMMDD");
        let expectedDate = moment(amAttrs.adjustmentDate).add(paymentNumber, 'months').format("YYYYMMDD");
        assert.equal(paymentDate, expectedDate, "Date for payment " + paymentNumber);
    }
});


QUnit.test("A4 amortizaton calculator: amortized payments", function(assert) {

    var amAttrs = {
        loanAmount: 10000,
        preferredPayment: 0,
        startDate: '2018-01-01',
        adjustmentDate: '2018-01-01',
        termInMonths: 12,
        interestOnly: false,
        amortizationPeriodMonths: 240,
        compoundingPeriodsPerYear: 2,
        paymentFrequency: 24,
        interestRate: 10
    };

    var payments = a4.getPayments(amAttrs);


    assert.equal(payments.length, 25, "Payment count for semi-monthly payments in a 1 year term");

    assert.equal(payments[0].paymentNumber, 0, "Payment number for payment 0");
    assert.equal(payments[0].interest, 0, "Interest payment for 0 days");
    assert.equal(payments[0].principal, 0, "Principal for payment 0");
    assert.equal(payments[0].balance, 10000, "Balance for payment 0");
    assert.equal(payments[0].date, amAttrs.adjustmentDate, "Adjustment date for payment 0");

    assert.equal(payments[24].paymentNumber, 24, "Payment number for payment 24");
    assert.equal(payments[24].interest, 40.09, "Interest paymen for payment 24");
    assert.equal(Number.parseFloat(payments[24].principal).toFixed(2), Number.parseFloat(7.40).toFixed(2), "Principal for payment 24");
    assert.equal(payments[24].balance, 9830.33, "Balance for payment 24");
    assert.equal(moment(payments[24].date).format("YYYYMMDD"), moment(amAttrs.adjustmentDate).add(12, 'months').format("YYYYMMDD"), "Date for payment 24");

});