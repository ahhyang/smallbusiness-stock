import { getDemoStore } from "@/lib/demo-store";
import { getDashboardStats, getInventory, getSalesReport } from "@/lib/data";
import { format, addDays, getDay } from "date-fns";

type AIResponse = {
  answer: string;
  data?: Record<string, unknown>;
};

export async function processAIQuery(
  query: string,
  branchId?: string | null,
): Promise<AIResponse> {
  const q = query.toLowerCase().trim();
  const store = getDemoStore();
  const stats = await getDashboardStats(branchId);
  const inventory = await getInventory(branchId);
  const popular = stats.popularProducts;

  if (
    q.includes("最好") ||
    q.includes("best") ||
    q.includes("popular") ||
    q.includes("卖得好") ||
    q.includes("卖得最好")
  ) {
    const top = popular[0];
    if (top) {
      return {
        answer: `今天 ${top.name} 销售量最高，共售出 ${top.count} 杯。${popular[1] ? `\n\n第二名是 ${popular[1].name}（${popular[1].count} 杯），第三名是 ${popular[2]?.name || "N/A"}（${popular[2]?.count || 0} 杯）。` : ""}`,
        data: { popularProducts: popular },
      };
    }
  }

  if (
    q.includes("库存") ||
    q.includes("stock") ||
    q.includes("快没了") ||
    q.includes("low") ||
    q.includes("不足") ||
    q.includes("补货")
  ) {
    const lowStock = store.getLowStock(branchId);
    const outOfStock = store.getOutOfStock(branchId);

    if (lowStock.length === 0 && outOfStock.length === 0) {
      return { answer: "目前所有库存都在安全水平之上，无需紧急补货。" };
    }

    const items = [...outOfStock, ...lowStock];
    const list = items
      .map(
        (i) =>
          `• ${i.name}: ${i.currentQty}${i.unit} / 最低 ${i.minimumQty}${i.unit}${i.currentQty <= 0 ? " ⚠️ 已售罄" : " ⚠️ 低库存"}`,
      )
      .join("\n");

    const urgent = items.slice(0, 2).map((i) => i.name).join(" 和 ");

    return {
      answer: `目前有 ${lowStock.length} 种库存低于最低库存量${outOfStock.length > 0 ? `，${outOfStock.length} 种已售罄` : ""}。其中 ${urgent || "无"} 最需要补货。\n\n${list}`,
      data: { lowStock: items },
    };
  }

  if (
    q.includes("今天") && (q.includes("卖") || q.includes("sales") || q.includes("多少"))
  ) {
    return {
      answer: `今天销售额 RM ${stats.todaySales.toFixed(2)}，共 ${stats.totalOrders} 笔订单，${stats.pendingOrders} 笔待处理。`,
      data: stats,
    };
  }

  if (
    q.includes("月") ||
    q.includes("month") ||
    q.includes("这个月")
  ) {
    const report = await getSalesReport(branchId, "month");
    return {
      answer: `本月销售额 RM ${report.totalSales.toLocaleString("en-MY", { minimumFractionDigits: 2 })}，共 ${report.orderCount} 笔订单，平均客单价 RM ${report.averageOrder.toFixed(2)}。${report.comparison > 0 ? `\n\n比上个月增加 ${report.comparison}%，其中 Smoothie 类产品增长最快。` : ""}`,
      data: report,
    };
  }

  if (
    q.includes("明天") ||
    q.includes("tomorrow") ||
    q.includes("准备") ||
    q.includes("预测")
  ) {
    const tomorrow = addDays(new Date(), 1);
    const tomorrowStr = format(tomorrow, "yyyy-MM-dd");
    const dayName = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][getDay(tomorrow)];

    const tomorrowBookings = store.bookings.filter(
      (b) => b.pickupDate === tomorrowStr && (!branchId || b.branchId === branchId),
    );
    const bookedDrinks = tomorrowBookings.reduce(
      (s, b) => s + b.items.reduce((si, i) => si + i.quantity, 0),
      0,
    );

    const avgDaily = Math.round(stats.totalOrders * 1.1);
    const suggested = Math.round(avgDaily + bookedDrinks * 0.5);

    return {
      answer: `根据过去数据以及明天（${dayName}）已有的 ${bookedDrinks} 杯预订，建议准备约 ${suggested} 杯饮料。\n\n已有预订：\n${tomorrowBookings.length > 0 ? tomorrowBookings.map((b) => `• ${b.pickupTime} - ${b.items.reduce((s, i) => s + i.quantity, 0)} 杯 (${b.customerName})`).join("\n") : "• 暂无预订"}`,
      data: { suggested, bookedDrinks, tomorrowBookings },
    };
  }

  if (
    q.includes("milk") ||
    q.includes("为什么") ||
    q.includes("why")
  ) {
    const milkItem = inventory.find((i) => i.name === "Milk");
    const milkTeaSales = popular.find((p) => p.name.includes("Milk Tea"));
    const smoothieSales = popular.find((p) => p.name.includes("Smoothie"));
    const todayBookings = store.getTodayBookings(branchId);
    const bookedDrinks = todayBookings.reduce(
      (s, b) => s + b.items.reduce((si, i) => si + i.quantity, 0),
      0,
    );

    return {
      answer: `今天 Milk Tea（${milkTeaSales?.count || 0} 杯）和 Smoothie（${smoothieSales?.count || 0} 杯）的订单量较高，加上今天已有 ${bookedDrinks} 杯预订，每杯饮料约消耗 150-200ml 牛奶，因此 Milk 库存（目前 ${milkItem ? `${(milkItem as { currentQty: number }).currentQty}L` : "不足"}）预计不足。\n\n建议立即进货 50L 牛奶。`,
    };
  }

  if (q.includes("booking") || q.includes("预订") || q.includes("预约")) {
    const todayBookings = store.getTodayBookings(branchId);
    const list = todayBookings
      .map(
        (b) =>
          `• ${b.pickupTime.slice(0, 5)} - ${b.items.reduce((s, i) => s + i.quantity, 0)} 杯 (${b.customerName})`,
      )
      .join("\n");

    return {
      answer: `今天共有 ${todayBookings.length} 个预订：\n\n${list || "暂无预订"}`,
      data: { todayBookings },
    };
  }

  if (q.includes("order") || q.includes("订单") || q.includes("pending")) {
    const pending = store.getPendingOrders(branchId);
    return {
      answer: `目前有 ${pending.length} 笔待处理订单。${pending.length > 0 ? `\n\n最新待处理：\n${pending.slice(0, 5).map((o) => `• #${o.orderNumber} - ${o.customerName || "Walk-in"} - RM ${o.total.toFixed(2)} (${o.status})`).join("\n")}` : ""}`,
    };
  }

  return {
    answer: `我可以帮你分析：\n\n• 「今天卖得最好是什么？」\n• 「哪些东西快没了？」\n• 「这个月销售怎么样？」\n• 「明天需要准备多少杯？」\n• 「为什么 Milk 快没了？」\n• 「今天的预订有哪些？」\n\n请试试上面的问题！`,
  };
}
