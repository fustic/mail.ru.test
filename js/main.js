$(function(){
    $(".iCalendar").calendar();

    $(".images").off("mouseenter","li").on("mouseenter","li",function(){
        var $this = $(this);
        if(!$this.data("proceeded")){
            var img = $this.find("img")[0];
            $this.find(".iSize").html(img.naturalWidth+"x"+img.naturalHeight+", XXкб");
            $this.data("proceeded", true);
        }
        $this.toggleClass("hover",100);
    });
    $(".images").off("mouseleave","li").on("mouseleave","li",function(){
        var $this = $(this);
        $this.toggleClass("hover",100);
    });
});
